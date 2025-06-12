import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function findPngFiles(dir) 
{
    if (!fs.existsSync(dir)) 
    {
        return [];
    }

    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.png'))
        .map(file => path.join(dir, file));
}

async function convertToWebp(inputDir, outputDir) 
{
    console.log(`Converting images from: ${ inputDir }`);

    const files = findPngFiles(inputDir);
    console.log(`Found ${ files.length } PNG files to convert`);

    if (files.length === 0) 
    {
        console.log(`No PNG files found in ${ inputDir }`);
        return;
    }

    for (const file of files) 
    {
        try 
        {
            const fileName = path.basename(file, '.png');
            const outputPath = path.join(outputDir, fileName + '.webp');

            await sharp(file)
                .webp({ quality: 85 })
                .toFile(outputPath);

            console.log(`✓ Converted: ${ path.basename(file) } -> ${ fileName }.webp`);
        }
        catch (error) 
        {
            console.error(`✗ Failed to convert ${ file }:`, error.message);
        }
    }
}

async function main() 
{
    try 
    {
        console.log('Starting image conversion to WebP...\n');

        const directories = [
            'public/champions/tftset14',
            'public/champions/tftset10',
            'public/emblems/tftset14',
            'public/emblems/tftset10',
            'public/trait-icons/tftset14',
            'public/trait-icons/tftset10',
            'public'
        ];

        for (const dir of directories) 
        {
            await convertToWebp(dir, dir);
            console.log('');
        }

        console.log('🎉 All images converted to WebP successfully!');
    }
    catch (error) 
    {
        console.error('Error during conversion:', error.message);
        process.exit(1);
    }
}

main();