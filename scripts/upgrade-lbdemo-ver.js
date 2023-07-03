const fs = require('fs')

let lbAnnotation = require('../packages/lb-annotation/package.json')
let lbComponents = require('../packages/lb-components/package.json')
let lbUtils = require('../packages/lb-utils/package.json')

let demoPath = "./packages/lb-demo/package.json"

let lbDemo = require('../packages/lb-demo/package.json')

lbDemo["dependencies"]["@labelbee/lb-annotation"] = lbAnnotation["version"]
lbDemo["dependencies"]["@labelbee/lb-components"] = lbComponents["version"]
lbDemo["dependencies"]["@labelbee/lb-utils"] = lbUtils["version"]

fs.writeFile(demoPath, JSON.stringify(lbDemo, null, "  "), function (err) {
    if (err) {
        console.log("upgrade fail", err)
    } else {
        console.log("upgrade success")
    }
})