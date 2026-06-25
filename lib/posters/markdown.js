import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import helpers from '../helpers.js'

const DEFAULT_FOLDER = 'content'

const formatFrontMatter = (formatted, site, config) => {
    const title = formatted.title ? String(formatted.title).replace(/"/g, '\\"') : 'Untitled'
    const tags = site.categories ? site.categories.join(', ') : ''
    const date = formatted.date ? new Date(formatted.date).toISOString() : new Date().toISOString()
    
    return `---
title: "${title}"
date: ${date}
${tags ? `tags: [${tags.split(', ').map(t => `"${t}"`).join(', ')}]` : ''}
${formatted.url ? `sourceUrl: "${formatted.url}"` : ''}
---`
}

export default async (config, formatted, site) => {
    try {
        const basePath = config.folder || DEFAULT_FOLDER
        const randomId = randomUUID().split('-')[4] // Use first part of UUID for brevity
        const postDir = path.join(basePath, randomId)
        
        // Create directory
        await fs.mkdir(postDir, { recursive: true })
        
        // Format content
        formatted.title = randomId
        const frontMatter = formatFrontMatter(formatted, site, config)
        const content = formatted.content || ''
        const fileContent = `${frontMatter}\n\n${content}`
        
        // Write index.md
        const indexPath = path.join(postDir, 'index.md')
        await fs.writeFile(indexPath, fileContent, 'utf8')
        
        console.log(`📝 Markdown post created at ${indexPath}!`)
    } catch (error) {
        console.error(`❌ Error creating markdown post:`, error.message)
    }
}