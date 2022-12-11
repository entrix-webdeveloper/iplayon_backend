
module.exports = gatewayURL = {
    contact: {
        url: "https://api.razorpay.com/v1/contacts",
        method: "post"
    },
    fundAccount: {
        url: "https://api.razorpay.com/v1/fund_accounts",
        method: "post"
    },
    payout: {
        url: "https://api.razorpay.com/v1/payouts",
        method: "post"
    },
    disableFundAccount: {
        url: "https://api.razorpay.com/v1/fund_accounts/key1",
        method: "patch"
    },
    fetchPayment: {
        url:
            "https://" +
            process.env.GATEWAY_ID +
            ":" +
            process.env.GATEWAY_SECRET +
            "@api.razorpay.com/v1/payments/key1?expand[]=card",
        method: "get"
    },
    validateFundAccount: {
        url: "https://api.razorpay.com/v1/fund_accounts/validations",
        method: "post"
    }
};