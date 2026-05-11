export default async function theme(args, shell) {
    const validThemes = ['matrix', 'ubuntu', 'retro', 'classic', 'nord', 'monokai'];
    const chosenTheme = args[0];

    if (!chosenTheme) {
        return `Available themes: ${validThemes.join(', ')}\nUsage: theme [name]`;
    }

    if (!validThemes.includes(chosenTheme)) {
        return `theme: '${chosenTheme}' is not a valid theme.`;
    }

    // Remove old theme classes
    validThemes.forEach(t => document.body.classList.remove(`theme-${t}`));
    
    // Add new theme class
    document.body.classList.add(`theme-${chosenTheme}`);
    
    // Persist choice
    localStorage.setItem('consoul_theme', chosenTheme);

    return `Theme changed to ${chosenTheme}.`;
}
