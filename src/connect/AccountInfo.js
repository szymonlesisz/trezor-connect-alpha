export default class AccountInfo {

    constructor(description: any){

    }

    async getAccountByDescription(description) {
        if (description == null) {
            return await this.waitForAccount();
        }
        if (typeof description === 'string' && description.substring(0,4) === 'xpub') {
            return await this.getAccountByXpub(description);
        }
        if (!isNaN(description)) {
            return await this.getAccountById(parseInt(description));
        }
        throw new Error('Wrongly formatted description.');
    }

    async waitForAccount(description) {

    }

    async getAccountById(id) {
        let onEnd = function() {};

        const accountP = Account.fromDevice(global.device, id, createCryptoChannel(), createBlockchain());
        return accountP.then(account => {
            return promptInfoPermission(id).then(() => {
                return account.discover(onEnd).then(() => account);
            });
        });
    }

    async getAccountByXpub(description) {

    }
}
