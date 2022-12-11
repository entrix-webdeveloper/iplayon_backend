## An OTP Verification app

### OTP can be sent to email or mobile depending on the service enabled.

### Routes and request body

`localhost:3000/api/v1/users/signup` Type: `POST` For signup request. This will send an OTP.
Request body <br />
    `{
	    "mobile": "XXXXXXXXXX"
    }`

`localhost:3000/api/v1/users/login` Type: `POST` For login request. This will send an OTP.
Request body <br />
    `{
	    "mobile": "XXXXXXXXXX"
    }`

`localhost:3000/api/v1/users/verifyOtp` Type: `POST` For verifying OTP and registering or logging in users depending upon the request body.
Request body for login <br />
    `{
	    "type": "login",
        "otp": "XXXXXX",
        "id": "602ba078a22f974b57cb2641" //An user id
    }`

Request body for register <br />
    `{
	    "type": "signup",
        "otp": "XXXXXX",
        "name": "John Doe",
        "mobile": "XXXXXXXXXX"
    }`