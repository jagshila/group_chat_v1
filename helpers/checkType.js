const { parameterMissing } = require('../services/api.service');
/**
 * Function to validate request data
 * @param {any} obj Data object to check
 * @param {any} structure Structure to check
 * @param {any} res Express Response object
 * @returns Boolean to check if given structure is satisfied
 */
function checkType (obj, structure, res) {
    const result = [];
    if (Object.keys(obj).length === 0) {
        parameterMissing(res, 'Request body should not be empty');
        return false;
    }
    structure.forEach(val => {
        if (obj[val.name] === undefined && val.required) {
            result.push(`${val.name} missing`);
        }
        // eslint-disable-next-line
    if (obj[val.name] != undefined && typeof (obj[val.name]) !== val.type) { return result.push(`${val.name} type should be ${val.type}`); };
    });

    if (result.length > 0) {
        parameterMissing(res, result.toString());
        return false;
    } else { return true; };
}

module.exports = { checkType };
