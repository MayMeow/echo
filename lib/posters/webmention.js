import * as cheerio from 'cheerio';

async function discoverEndpoint(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        
        // Check headers
        const linkHeader = res.headers.get('link');
        if (linkHeader) {
            const matches = linkHeader.match(/<([^>]+)>;\s*rel="?(?:webmention|http:\/\/webmention.org\/?)"?/);
            if (matches) return matches[1];
        }

        // Check HTML
        const html = await res.text();
        const $ = cheerio.load(html);
        
        let endpoint = $('link[rel~="webmention"]').attr('href') || $('a[rel~="webmention"]').attr('href');
        
        if (endpoint) {
             return new URL(endpoint, url).href;
        }
    } catch (e) {
        // console.error(`Error discovering endpoint for ${url}:`, e.message);
    }
    return null;
}

async function sendWebmention(source, target) {
    if (source === target) return;
    
    const endpoint = await discoverEndpoint(target);
    if (!endpoint) {
        // console.log(`No webmention endpoint found for ${target}`);
        return;
    }

    console.log(`Sending webmention to ${endpoint} (Source: ${source}, Target: ${target})`);
    
    const params = new URLSearchParams();
    params.append('source', source);
    params.append('target', target);

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (res.ok) {
            console.log(`✅ Webmention sent to ${target}`);
        } else {
            console.log(`❌ Failed to send webmention to ${target}: ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        console.error(`Error sending webmention to ${target}:`, e.message);
    }
}

export default async (config, formatted, site) => {
    const source = formatted.content;
    
    // Check if source is a valid URL
    try {
        new URL(source);
    } catch {
        console.log('⚠️ formatted.content is not a valid URL. Skipping webmention sending.');
        return;
    }

    console.log(`🔍 Discovering links in ${source}...`);

    try {
        const res = await fetch(source);
        const html = await res.text();
        const $ = cheerio.load(html);
        
        const targets = new Set();
        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('http')) {
                targets.add(href);
            }
        });

        console.log(`Found ${targets.size} links. Sending webmentions...`);

        for (const target of targets) {
            await sendWebmention(source, target);
        }
        
        console.log('🗣️ Webmentions sent!');
        
    } catch (e) {
        console.error('Error processing source for webmentions:', e);
    }
}
