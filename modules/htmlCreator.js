class HtmlCreator{
    constructor(){
        this.scriptSrc = "";
    }

    create = () => {
        return `
            <!DOCTYPE html>
            <html>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <head>
                    <script type="module" src="${this.scriptSrc}"></script>
                </head>
                <body>
                </body>
            </html>
        `
    }
}

export default HtmlCreator;