#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const Colors = {
    HEADER: '\x1b[95m',
    OKBLUE: '\x1b[94m',
    OKGREEN: '\x1b[92m',
    WARNING: '\x1b[93m',
    FAIL: '\x1b[91m',
    ENDC: '\x1b[0m',
    BOLD: '\x1b[1m',
    UNDERLINE: '\x1b[4m',
    ORANGE: '\x1b[38;5;214m'
};

function printAnimated(text, color = Colors.ENDC, delay = 30) {
    return new Promise(resolve => {
        let i = 0;
        function printChar() {
            if (i < text.length) {
                process.stdout.write(color + text[i] + Colors.ENDC);
                i++;
                setTimeout(printChar, delay);
            } else {
                console.log();
                resolve();
            }
        }
        printChar();
    });
}

function spinnerAnimation(duration = 2000) {
    return new Promise(resolve => {
        const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        const endTime = Date.now() + duration;
        let i = 0;

        const interval = setInterval(() => {
            if (Date.now() < endTime) {
                process.stdout.write(`\r${Colors.ORANGE}Menyimpan ke sistem... ${spinner[i % spinner.length]}${Colors.ENDC}`);
                i++;
            } else {
                clearInterval(interval);
                process.stdout.write(`\r${Colors.OKGREEN}Tersimpan!${' '.repeat(20)}${Colors.ENDC}\n`);
                resolve();
            }
        }, 100);
    });
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log("Penggunaan: node add_chapter.js <judul> <konten>");
        process.exit(1);
    }

    const title = args[0];
    const content = args[1];

    // Clear terminal
    console.clear();

    await printAnimated("✨ ----------------------------------------- ✨", Colors.ORANGE);
    await printAnimated("       CERITAKU - PUBLIKASI CHAPTER BARU       ", Colors.BOLD + Colors.ORANGE);
    await printAnimated("✨ ----------------------------------------- ✨", Colors.ORANGE);
    console.log();

    await printAnimated(`📝 Judul: ${title}`, Colors.OKBLUE);
    await printAnimated(`Panjang Konten: ${content.length} karakter`, Colors.OKBLUE);
    console.log();

    // Path to JS file
    const jsPath = path.join(__dirname, 'assets', 'data', 'stories.js');

    if (!fs.existsSync(jsPath)) {
        await printAnimated("❌ Error: File assets/data/stories.js tidak ditemukan!", Colors.FAIL);
        process.exit(1);
    }

    try {
        // Load existing data
        const rawContent = fs.readFileSync(jsPath, 'utf-8');
        // Extract JSON part from "const storiesData = {...};"
        const jsonString = rawContent.replace('const storiesData = ', '').replace(/;$/, '');
        const data = JSON.parse(jsonString);

        // Append new chapter
        const newChapter = {
            title: title,
            content: content
        };
        data.main_story.chapters.push(newChapter);

        // Show saving animation
        await spinnerAnimation();

        // Save back to JS format
        const newJsContent = `const storiesData = ${JSON.stringify(data, null, 2)};`;
        fs.writeFileSync(jsPath, newJsContent, 'utf-8');

        console.log();
        await printAnimated("🎉 Sukses! Chapter berhasil dipublikasikan.", Colors.OKGREEN);
        await printAnimated("Buka index.html di browser untuk melihat hasilnya.", Colors.OKGREEN);

    } catch (e) {
        await printAnimated(`❌ Terjadi kesalahan: ${e.message}`, Colors.FAIL);
    }
}

main();
