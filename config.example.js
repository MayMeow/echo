import helpers from './lib/helpers.js'
import presets from './lib/presets.js'
import { SERVICES } from './lib/posters/index.js'

export default {
    services: {
        [SERVICES.MICROBLOG]: {
            type: SERVICES.MICROBLOG,
            siteUrl: '', // https://mycoolname.micro.blog
            apiKey: '', // get an API from https://micro.blog/account/apps
        },
        [SERVICES.BLUESKY]: {
            type: SERVICES.BLUESKY,
            service: 'https://bsky.social', // Optional, defaults to bsky.social
            identifier: 'user.bsky.social', // Your handle
            password: 'app-password', // App password (Settings > App Passwords)
        }
    },
    sites: [
        {
            name: "example.com",
            feed: "http://example.com/feed",
            categories: ["my category"],
            transform: presets.default,
            services: [SERVICES.MICROBLOG]
        }
    ]
}
