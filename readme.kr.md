# Echo - RSS 크로스 포스터

![Echo 스크린샷](screenshot.png)

## 무엇인가요?

Echo는 Micro.blog 및 Mastodon을 포함한 다양한 서비스에 RSS 피드의 새 항목을 게시하는 Node 스크립트입니다.

### "Echo"라고 이름 붙인 이유는 무엇인가요?

RSS 피드를 다루므로 "Feeder"가 적합합니다. "Feeder"는 "Echo Park"이라는 앨범을 가진 밴드입니다. "Echo"는 앨범 링크와 "echo"라는 단어의 의미 모두를 담고 있어 좋은 이름입니다.

## 요구 사항

- Node 19 (이전 버전에서도 작동할 수 있지만, 제가 사용한 버전입니다)
- 실행할 서버/컴퓨터/감자

## 설치

1. 이 저장소를 클론합니다.
2. `npm install`을 실행하여 Node 모듈을 설치합니다.
3. `cp config.example.js config.js`를 실행하여 새 구성 파일을 만듭니다.
4. RSS 피드와 서비스를 설정합니다 ([구성](#configuration) 참조).
5. `node index.js init`을 실행하여 설정을 완료합니다. 이렇게 하면 최신 ID가 저장되어 이후에는 새 게시물만 게시됩니다. 피드의 일부 항목만 게시하려면 `data/nameofsite.txt`에 게시하지 않으려는 최신 항목의 ID를 추가합니다.
6. `node index.js`를 정기적으로 실행하는 cron 작업을 설정합니다.

🚨 **경고**: `node index.js init`을 먼저 실행하지 않으면 스크립트가 RSS 피드의 **모든** 게시물을 게시합니다. 아마도 원하지 않을 것입니다.

`node index.js dry`를 실행할 수도 있습니다. 그러면 생성될 게시물을 기록하지만 실제로 게시하지는 않습니다.

Echo는 마지막으로 게시된 항목을 추적하므로 이후 실행 시에는 새 게시물만 게시합니다.

GitHub 액션을 사용하여 Echo를 실행할 수도 있습니다. 자세한 내용은 [루이스의 블로그 게시물](https://lewisdale.dev/post/using-gitea-github-actions-for-triggering-echo/)을 참조하세요.

## 구성

구성해야 할 부분은 `sites`와 `services`의 두 가지입니다. `sites`는 크로스 게시하려는 RSS 피드이고, `services`는 크로스 게시하려는 서비스입니다.

[Echo 웹사이트](https://echo.rknight.me)로 이동하여 구성 생성기를 사용하고 생성된 구성을 `config.js`에 붙여넣거나 아래에서 수동으로 설정하는 방법을 확인하십시오.

### 사이트

`config.sites`는 크로스 게시하려는 RSS 피드의 배열입니다. 사이트는 다음 다섯 가지 속성을 갖습니다.

- `name` (필수): 아무거나 지정할 수 있습니다 (파일 이름에 사용되므로 특수 문자는 사용하지 않는 것이 좋습니다).
- `feed` (필수): Micro.blog에 게시하려는 피드 URL (예: <https://mycoolsite.com/feed>).
- `categories` (선택 사항 - Micro.blog에만 해당): 사이트에 할당할 범주의 배열 (예: `["Cat One", "Cat Two"]`).
- `services`: 크로스 게시하려는 서비스입니다. [서비스](#services)를 참조하십시오.
- `transform`: 다음 두 가지 함수가 있는 객체입니다 (아래에서 사전 설정 변환 참조):
  - `getId`: Echo에 각 피드 항목의 ID에 사용할 속성을 알려줍니다. 대부분의 피드는 `id` 또는 `guid`를 사용하지만 다른 속성을 사용하는 경우 여기에 설정할 수 있습니다.
  - `format`: 게시물의 제목, 본문 및 날짜 형식을 지정하는 방법입니다. 이 함수는 콘텐츠, 날짜 및 선택적 제목이 포함된 객체를 반환합니다.
  - `filter` (선택 사항): 피드에서 특정 항목을 필터링해야 하는 경우 사용합니다. 예를 들어 Letterboxd에는 업데이트 중인 목록에 대한 항목이 포함되어 있으며, 이러한 항목은 게시되지 않도록 하려고 합니다.

#### 예시 사이트 구성

```js
{
    name: "example.com",
    feed: "http://example.com/feed",
    categories: ["my category"],
    services: [SERVICES.MICROBLOG, SERVICES.WEBHOOK],
    transform: {
        getId: (data) => {
            return data.id
        },
        format: (data) => {
            return {
                content: data.content,
                date: data.isoDate,
                title: data.title, // 선택 사항
            }
        },
        filter: (items) => {
            return items.filter(item => {
                return !item.link.includes('/list/')
            })
        }
    }
}
```

### 사전 설정 변환

Echo에는 `getId` 및 `format` 함수를 각 사이트에 대해 작성하는 대신 사용할 수 있는 몇 가지 사전 설정이 있습니다. 이러한 사전 설정은 [`presets.js`](lib/presets.js)에서 확인할 수 있습니다. 예를 들어 Letterboxd 또는 status.lol 사전 설정을 사용하려면 다음과 같이 할 수 있습니다.

```js
{
    name: "letterboxd.com",
    feed: "http://letterboxd.com/exampleuser/rss",
    categories: ["movies"],
    transform: presets.letterboxd,
},
{
    name: "status.lol",
    feed: "http://exampleuser.status.lol/feed",
    categories: ["status"],
    transform: presets.statuslol,
}
```

`format`에서 게시물의 본문을 정의하여 원하는 대로 게시물의 형식을 지정할 수 있습니다. Echo에는 몇 가지 유용한 라이브러리가 포함된 `helpers.js`가 포함되어 있어 사용이 간편합니다.

- HTML을 마크다운으로 변환하려면 `helpers.toMarkdown(text)`를 사용하십시오.
- [Cheerio](https://cheerio.js.org/)를 사용하려면 `helpers.cheerioLoad(text)`를 사용하십시오.
- UUID를 생성하려면 `helpers.generateUuid()`를 사용하십시오.
- Mastodon에서 링크 길이를 계산하는 방식에 따라 게시물의 길이를 가져옵니다 (예: 링크는 항상 23자). `helpers.getMastodonLength(string)`
- 모든 링크를 배열로 가져옵니다. `helpers.getLinks(string)`
- HTML 엔터티를 인코딩 및 디코딩합니다. `helpers.decode(string)` 및 `helpers.encode(string)`

```js
format: (data) => {
    const formatted = presets.default.format(data)

    // Cheerio를 사용하여 첫 번째 링크를 가져와 콘텐츠에 추가합니다.
    const $ = helpers.cheerioLoad(formatted.content)
    const firstLink = $('a:first').attr('href')
    formatted.content += ` ${firstLink}`

    // 마크다운 형식으로 변환합니다.
    formatted.content = helpers.toMarkdown(formatted.content)
    return formatted
}
```

### 서비스

각 서비스에는 API 작동 방식에 따라 다른 값 세트가 필요합니다.

#### Micro.blog

|키|값|참고|
|---|---|---|
|`siteUrl`|게시할 Micro.blog 사이트|예: `https://coolsite.micro.blog`|
|`apiKey`|Micro.blog API 키|API 키는 [https://micro.blog/account/apps](https://micro.blog/account/apps)에서 얻을 수 있습니다.|

#### Mastodon

|키|값|참고|
|---|---|---|
|`instance`|Mastodon 인스턴스|예: `https://social.lol`|
|`accessToken`|Mastodon 인스턴스에서 `Preferences > Development > New Application`으로 이동하여 액세스 토큰을 가져옵니다.|
|`visibility` (선택 사항, 기본값 `public`)|`public` `unlisted` `private` `direct`|
|`sensitive` (선택 사항, 기본값 `false`)|`false` `true`|

#### 웹훅

웹훅 서비스는 `transform.format` (사이트 구성에 설정됨)의 결과를 지정된 URL로 `POST` 요청으로 보냅니다.

|키|값|참고|
|---|---|---|
|`url`|게시할 URL|

#### Omnivore

Omnivore 서비스는 Omnivore 계정에 URL을 저장합니다.

|키|값|참고|
|---|---|---|
|`apiKey`|Omnivore API 키|

#### GitHub

GitHub 저장소에 새 파일을 만듭니다.

| 키 | 값 | 참고 |
|---|---|---|
| `token` | GitHub 토큰 |
| `repo` | 커밋할 저장소 | 예: `rknightuk/echo` |
| `branch` | 커밋할 브랜치 |
| `committer` | `name` 및 `email` 값을 갖는 객체 | 예: `{ name: 'Robb', email: 'robb@example.com' }`

GitHub에 게시하려면 `format` 함수에서 `content`와 `filePath`를 반환해야 합니다. `filePath`는 파일이 GitHub 저장소에 저장될 경로입니다 (예: `src/posts/movies/2024-02-09.md`). 선택적으로 `commit` 메시지를 반환할 수도 있습니다. 이 메시지를 지정하지 않으면 기본적으로 `New post`가 사용됩니다. GitHub에 대한 `format` 함수의 예:

```js
format: (data) => {
    return {
        content: data.title,
        date: new Date(data.isoDate).toISOString(),
        filePath: `src/posts/movies/${new Date().getFullYear()}/${new Date().toISOString().split('T')[0]}.md`,
        commit: `Add ${data.title}`,
    }
}
```

#### LinkAce

|키|값|참고|
|---|---|---|
|`domain`|LinkAce를 설치한 도메인|예: `https://links.example.com`|
|`apiKey`|LinkAce API 키||

`format`에서 반환되는 `content`는 링크여야 합니다. 사이트의 범주는 태그로 변환됩니다. `format`에 포함된 태그는 `categories`와 병합됩니다.

```js
{
    name: 'mycoollinkfeed',
    feed: 'https://example.com/linkfeed.xml',
    categories: ['ATag'],
    transform: {
        getId: presets.default.getId,
        format: (data) => {
            return {
                content: data.external_url,
                date: data.date_published,
                tags: data._custom.tags,
            }
        }
    },
    services: [SERVICES.LINKACE],
},
```

#### 웹 언급

| 키 | 값 | 참고 |
|---|---|---|
| 웹 언급에는 구성이 필요하지 않습니다 | | |

`format`에서 반환되는 `content`는 링크여야 합니다.