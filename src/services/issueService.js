const issues = require("../models/issueModel");

function createIssue(issueData) {
    const issue = {
        id: issues.length + 1,
        product: issueData.product,
        warehouse: issueData.warehouse,
        quantity: issueData.quantity,
        issuedTo: issueData.issuedTo,
        issuedDate: issueData.issuedDate || new Date(),
        reference: issueData.reference || `ISS-${issues.length + 1}`,
        status: "ISSUED"
    };

    issues.push(issue);

    return issue;
}

function getIssues() {
    return issues;
}

module.exports = {
    createIssue,
    getIssues
};