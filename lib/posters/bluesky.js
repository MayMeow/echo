import { AtpAgent, RichText } from '@atproto/api'
import helpers from '../helpers.js'

export default async (config, formatted, site) => {
    const agent = new AtpAgent({
        service: config.service || 'https://bsky.social',
    })

    try {
        await agent.login({
            identifier: config.identifier,
            password: config.password,
        })
    } catch (e) {
        console.error('❌ Bluesky Login Failed:', e.message)
        return
    }

    const categories = (site.categories || []).map(c => `#${c}`).join(' ')
    let formattedContent = site.skipConversion ? formatted.content : helpers.htmlToText(formatted.content)
    formattedContent = `${formattedContent} ${categories}`

    const rt = new RichText({
        text: formattedContent,
    })
    
    // Automatically detects mentions and links
    await rt.detectFacets(agent) 

    try {
        const res = await agent.post({
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
        })

        console.log(`⭐ Created post at ${res.uri}!`)
    } catch (e) {
        console.error('❌ Bluesky Post Failed:', e.message)
    }
}
