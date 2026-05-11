const STORAGE_KEY = 'consoul_vfs';

const DEFAULT_VFS = {
    '/': {
        type: 'dir',
        permissions: 'rwxr-xr-x',
        owner: 'root',
        children: {
            'bin': { type: 'dir', permissions: 'rwxr-xr-x', owner: 'root', children: {} },
            'home': {
                type: 'dir',
                permissions: 'rwxr-xr-x',
                owner: 'root',
                children: {
                    'ayman': {
                        type: 'dir',
                        permissions: 'rwxr-xr-x',
                        owner: 'ayman',
                        children: {
                            'readme.txt': { type: 'file', permissions: 'rw-r--r--', owner: 'ayman', content: 'Welcome to Consoul Terminal!' }
                        }
                    }
                }
            },
            'tmp': { type: 'dir', permissions: 'rwxrwxrwx', owner: 'root', children: {} }
        }
    }
};

class VFS {
    constructor() {
        this.root = this.load();
    }

    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                
                // MIGRATION: move 'home/user' to 'home/ayman'
                if (parsed['/'] && parsed['/'].children && parsed['/'].children.home && parsed['/'].children.home.children.user) {
                    console.log("Migrating VFS from 'user' to 'ayman'...");
                    const userData = parsed['/'].children.home.children.user;
                    delete parsed['/'].children.home.children.user;
                    parsed['/'].children.home.children.ayman = userData;
                    parsed['/'].children.home.children.ayman.owner = 'ayman';
                    // Update permissions recursively
                    const updatePerms = (node) => {
                        if (node.owner === 'user') node.owner = 'ayman';
                        if (node.children) {
                            for (const key in node.children) updatePerms(node.children[key]);
                        }
                    };
                    updatePerms(parsed['/'].children.home.children.ayman);
                    this.save(parsed);
                    return parsed;
                }

                if (parsed['/'] && parsed['/'].children && parsed['/'].children.home && parsed['/'].children.home.children.ayman) {
                    return parsed;
                }
            } catch (e) {
                console.error("Failed to parse VFS data, resetting to default.", e);
            }
        }
        this.save(DEFAULT_VFS);
        return DEFAULT_VFS;
    }

    save(data = this.root) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    resolvePath(path, cwd = '/') {
        let absolutePath;
        if (path.startsWith('/')) {
            absolutePath = path;
        } else {
            absolutePath = cwd === '/' ? '/' + path : cwd + '/' + path;
        }
        
        // Remove multiple slashes and handle root
        const parts = absolutePath.split('/').filter(p => p.length > 0);
        const stack = [];
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                stack.pop();
            } else {
                stack.push(part);
            }
        }
        return '/' + stack.join('/');
    }

    getNode(path, cwd = '/') {
        const normalizedPath = this.resolvePath(path, cwd);
        if (normalizedPath === '/') return this.root['/'];

        const parts = normalizedPath.split('/').filter(p => p.length > 0);
        let current = this.root['/'];

        for (const part of parts) {
            if (!current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }
        return current;
    }

    // Additional methods (mkdir, touch, etc.) will be used by commands
    createNode(path, type, content = '', cwd = '/', owner = 'ayman') {
        const normalizedPath = this.resolvePath(path, cwd);
        const parts = normalizedPath.split('/').filter(p => p.length > 0);
        const name = parts.pop();
        const parentPath = '/' + parts.join('/');
        const parent = this.getNode(parentPath);

        if (parent && parent.type === 'dir' && !parent.children[name]) {
            parent.children[name] = { 
                type, 
                permissions: type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--',
                owner,
                children: type === 'dir' ? {} : undefined, 
                content: type === 'file' ? content : undefined 
            };
            this.save();
            return true;
        }
        return false;
    }

    setPermissions(path, perms, cwd = '/') {
        const node = this.getNode(path, cwd);
        if (node) {
            node.permissions = perms;
            this.save();
            return true;
        }
        return false;
    }

    setOwner(path, owner, cwd = '/') {
        const node = this.getNode(path, cwd);
        if (node) {
            node.owner = owner;
            this.save();
            return true;
        }
        return false;
    }

    updateFile(path, content, append = false, cwd = '/') {
        const node = this.getNode(path, cwd);
        if (node && node.type === 'file') {
            node.content = append ? (node.content + content) : content;
            this.save();
            return true;
        }
        return false;
    }

    removeNode(path, cwd = '/') {
        const normalizedPath = this.resolvePath(path, cwd);
        if (normalizedPath === '/') return false;

        const parts = normalizedPath.split('/').filter(p => p.length > 0);
        const name = parts.pop();
        const parentPath = '/' + parts.join('/');
        const parent = this.getNode(parentPath);

        if (parent && parent.children[name]) {
            delete parent.children[name];
            this.save();
            return true;
        }
        return false;
    }

    getSuggestions(partialPath, cwd = '/') {
        const normalizedPath = this.resolvePath(partialPath, cwd);
        const parts = normalizedPath.split('/').filter(p => p.length > 0);
        
        let searchName = '';
        let parentPath = '/';

        if (partialPath.endsWith('/')) {
            parentPath = normalizedPath;
            searchName = '';
        } else {
            searchName = parts.pop() || '';
            parentPath = '/' + parts.join('/');
        }

        const parent = this.getNode(parentPath);
        if (parent && parent.type === 'dir') {
            return Object.keys(parent.children)
                .filter(name => name.startsWith(searchName))
                .map(name => {
                    const node = parent.children[name];
                    return name + (node.type === 'dir' ? '/' : '');
                });
        }
        return [];
    }
}

export const vfs = new VFS();
