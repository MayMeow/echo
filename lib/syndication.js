import { promises as fs } from 'fs'
import path from 'path'

export async function trackSyndication(echoPath, siteName, originalUrl, postedUrl, posterType) {
    const syndicationFile = path.join(echoPath, 'data', `${siteName}-syndication.json`)
    
    try {
        let syndication = {}
        
        // Load existing syndication file if it exists
        if (await fileExists(syndicationFile)) {
            const content = await fs.readFile(syndicationFile, 'utf8')
            syndication = JSON.parse(content)
        }
        
        // Initialize entry for this URL if it doesn't exist
        if (!syndication[originalUrl]) {
            syndication[originalUrl] = []
        }
        
        // Add new syndication entry
        syndication[originalUrl].push({
            url: postedUrl,
            type: posterType,
            date: new Date().toISOString()
        })
        
        // Write back to file
        await fs.writeFile(syndicationFile, JSON.stringify(syndication, null, 2), 'utf8')
        console.log(`📊 Syndication tracked: ${siteName}`)
    } catch (error) {
        console.error(`❌ Error tracking syndication:`, error.message)
    }
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
}