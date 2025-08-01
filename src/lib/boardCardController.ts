export function fixDescriptionLength(description) {
        let fixedDescription = ""
        const splittedDescription = description.split("")
        splittedDescription.map((item, index) => {
            if (index <= 26) {
            fixedDescription = fixedDescription + item
            }
        })
        return fixedDescription
    }

