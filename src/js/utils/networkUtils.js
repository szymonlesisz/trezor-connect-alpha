import 'whatwg-fetch';

export const httpRequest = (url: string, json: boolean): any => {
    return fetch(url, { credentials: 'same-origin' }).then((response) => {
        if (response.status === 200) {
            return response.text().then(result => (json ? JSON.parse(result) : result));
        } else {
            throw new Error(response.statusText);
        }
    })
}
