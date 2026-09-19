# SMS API
Text.lk - SMS Gateway Sri lanka SMS API allows you to send and receive SMS messages to and from any country in the world through a REST API. Each message is identified by a unique random ID so that users can always check the status of a message using the given endpoint.

API Endpoint
Markup

https://app.text.lk/api/v3/sms/send

Parameters
Parameter 	Required 	Description
Authorization 	Yes
	When calling our API, send your api token with the authentication type set as Bearer (Example: Authorization: Bearer {api_token})
Accept 	Yes
	Set to application/json
Send outbound SMS

Text.lk - SMS Gateway Sri lanka's Programmable SMS API enables you to programmatically send SMS messages from your web application. First, you need to create a new message object. Text.lk - SMS Gateway Sri lanka returns the created message object with each request.

Send your first SMS message with this example request.

API Endpoint
Markup

https://app.text.lk/api/v3/sms/send

Parameters
Parameter 	Required 	Type 	Description
recipient 	Yes
	string 	Number to send message. Use comma (,) to send multiple numbers. Ex. 94710000000,94710000000
sender_id 	Yes
	string 	The sender of the message. This can be a telephone number (including country code) or an alphanumeric string. In case of an alphanumeric string, the maximum length is 11 characters.
type 	Yes
	string 	The type of the message. For text message you have to insert plain as sms type.
message 	Yes
	string 	The body of the SMS message.
schedule_time 	No
	datetime 	The scheduled date and time of the message in RFC3339 format (Y-m-d H:i)
dlt_template_id 	No
	string 	The ID of your registered DLT (Distributed Ledger Technology) content template.
Example request for Single Number
PHP

curl -X POST https://app.text.lk/api/v3/sms/send \
-H 'Authorization: Bearer ' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
"recipient":"94710000000",
"sender_id":"TextLKDemo",
"type":"plain",
"message":"This is a test message"
}'

Example request for Multiple Numbers
PHP

curl -X POST https://app.text.lk/api/v3/sms/send \
-H 'Authorization: Bearer ' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
"recipient":"94710000000,94710000000",
"sender_id":"TextLKDemo",
"type":"plain",
"message":"This is a test message",
"schedule_time=2021-12-20 07:00"
}'

Returns

Returns a contact object if the request was successful.
JSON

{
    "status": "success",
    "data": "sms reports with all details",
}

If the request failed, an error object will be returned.
JSON

{
    "status": "error",
    "message" : "A human-readable description of the error."
}

Send Campaign Using Contact list

Text.lk - SMS Gateway Sri lanka's Programmable SMS API enables you to programmatically send Campaigns from your web application. First, you need to create a new message object. Text.lk - SMS Gateway Sri lanka returns the created message object with each request.

Send your first Campaign Using Contact List with this example request.

API Endpoint
Markup

https://app.text.lk/api/v3/sms/campaign

Parameters
Parameter 	Required 	Type 	Description
contact_list_id 	Yes
	string 	Contact list to send message. Use comma (,) to send multiple contact lists. Ex. 6415907d0d7a6,6415907d0d37a
sender_id 	Yes
	string 	The sender of the message. This can be a telephone number (including country code) or an alphanumeric string. In case of an alphanumeric string, the maximum length is 11 characters.
type 	Yes
	string 	The type of the message. For text message you have to insert plain as sms type.
message 	Yes
	string 	The body of the SMS message.
schedule_time 	No
	datetime 	The scheduled date and time of the message in RFC3339 format (Y-m-d H:i)
dlt_template_id 	No
	string 	The ID of your registered DLT (Distributed Ledger Technology) content template.
Example request for Single Contact List
PHP

curl -X POST https://app.text.lk/api/v3/sms/campaign \
-H 'Authorization: Bearer ' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
"recipient":"6415907d0d37a",
"sender_id":"TextLKDemo",
"type":"plain",
"message":"This is a test message"
}'

Example request for Multiple Contact Lists
PHP

curl -X POST https://app.text.lk/api/v3/sms/campaign \
-H 'Authorization: Bearer ...a' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
"recipient":"6415907d0d37a,6415907d0d7a6",
"sender_id":"TextLKDemo",
"type":"plain",
"message":"This is a test message",
"schedule_time=2021-12-20 07:00"
}'

Returns

Returns a contact object if the request was successful.
JSON

{
    "status": "success",
    "data": "campaign reports with all details",
}

If the request failed, an error object will be returned.
JSON

{
    "status": "error",
    "message" : "A human-readable description of the error."
}

View an SMS

You can use Text.lk - SMS Gateway Sri lanka's SMS API to retrieve information of an existing inbound or outbound SMS message.

You only need to supply the unique message id that was returned upon creation or receiving.

API Endpoint
Markup

https://app.text.lk/api/v3/sms/{uid}

Parameters
Parameter 	Required 	Type 	Description
uid 	Yes
	string 	A unique random uid which is created on the Text.lk - SMS Gateway Sri lanka platform and is returned upon creation of the object.
Example request
PHP

curl -X GET https://app.text.lk/api/v3/sms/606812e63f78b \
-H 'Authorization: Bearer ...a' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \

Returns

Returns a contact object if the request was successful.
JSON

{
    "status": "success",
    "data": "sms data with all details",
}

If the request failed, an error object will be returned.
JSON

{
    "status": "error",
    "message" : "A human-readable description of the error."
}

View all messages

API Endpoint
Markup

https://app.text.lk/api/v3/sms/

Example request
PHP

curl -X GET https://app.text.lk/api/v3/sms \
-H 'Authorization: Bearer ...a' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \

Returns

Returns a contact object if the request was successful.
JSON

{
    "status": "success",
    "data": "sms reports with pagination",
}

If the request failed, an error object will be returned.
JSON

{
    "status": "error",
    "message" : "A human-readable description of the error."
}

📅 View Messages via DateTime, SMS Type & Timezone

API Endpoint
Markup

GET https://app.text.lk/api/v3/sms?start_date={YYYY-MM-DD HH:MM:SS}&end_date={YYYY-MM-DD HH:MM:SS}&sms_type={plain|unicode|voice|mms|whatsapp|otp|viber}&direction={outgoing|incoming|api}&timezone={e.g. Asia/Hong_Kong}

Parameters
Parameter 	Required 	Type 	Description
start_date 	Yes 	string 	Start datetime to filter messages. Format: YYYY-MM-DD HH:MM:SS. Must be in the timezone provided (defaults to UTC).
end_date 	Yes 	string 	End datetime to filter messages. Format: YYYY-MM-DD HH:MM:SS. Must be in the timezone provided (defaults to UTC).
timezone 	No 	string 	Optional. IANA timezone (e.g., Asia/Hong_Kong, UTC, America/New_York). Used to interpret start_date and end_date.
sms_type 	No 	string 	Optional. Filter by SMS type: plain, unicode, voice, mms, whatsapp, otp, viber.
direction 	No 	string 	Optional. Filter by SMS direction: outgoing, incoming, api.
🧪 Example Request
PHP

curl -X GET "https://app.text.lk/api/v3/sms?start_date=2025-05-01 08:00:00&end_date=2025-05-22 18:00:00&sms_type=plain&direction=outgoing&timezone=Asia/Hong_Kong" \
  -H "Authorization: Bearer ...a" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

✅ Success Response
JSON

{
    "status": "success",
    "message": "SMS data fetched successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "uid": "683831eda796e",
                "to": "94710000000",
                "from": "Codeglen",
                "message": "test message",
                "sms_type": "plain",
                "direction": "api",
                "status": "Delivered",
                "sms_count": 1,
                "cost": "1",
                "sent_at": "2025-05-29 16:07:41"
            }
        ],
        "first_page_url": "https://app.text.lk/api/v3/sms?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "https://app.text.lk/api/v3/sms?page=1",
        "links": [
            {
                "url": null,
                "label": "« Previous",
                "active": false
            },
            {
                "url": "https://app.text.lk/api/v3/sms?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "Next »",
                "active": false
            }
        ],
        "next_page_url": null,
        "path": "https://app.text.lk/api/v3/sms",
        "per_page": 25,
        "prev_page_url": null,
        "to": 1,
        "total": 1
    }
}

❌ Error Response
JSON

{
  "status": "error",
  "message": "Invalid datetime format. Use Y-m-d H:i:s"
}

View Campaign

You can use Text.lk - SMS Gateway Sri lanka's Campaign API to retrieve information of an existing Campaigns.

You only need to supply the unique campaign id that was returned upon creation or receiving.

API Endpoint
Markup

https://app.text.lk/api/v3/campaign/{uid}

Parameters
Parameter 	Required 	Type 	Description
uid 	Yes
	string 	A unique random uid which is created on the Text.lk - SMS Gateway Sri lanka platform and is returned upon creation of the object.
Example request
PHP

curl -X GET https://app.text.lk/api/v3/campaign/606812e63f78b/view \
-H 'Authorization: Bearer ...a' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \

Returns

Returns a contact object if the request was successful.
JSON

{
    "status": "success",
    "data": "campaign data with all details",
}

If the request failed, an error object will be returned.
JSON

{
    "status": "error",
    "message" : "A human-readable description of the error."
}


# PROFILE API
Profile API
Text.lk - SMS Gateway Sri lanka Profile API allows you to retrieve your total remaining sms unit, used sms unit, and your profile information.

API Endpoint
Markup

https://app.text.lk/api/v3/me

Parameters
Parameter 	Required 	Description
Authorization 	Yes
	When calling our API, send your api token with the authentication type set as Bearer (Example: Authorization: Bearer {api_token})
Accept 	Yes
	Set to application/json
View sms unit

API Endpoint
Markup

https://app.text.lk/api/v3/balance

Example request
PHP

curl -X GET https://app.text.lk/api/v3/balance \
-H 'Authorization: Bearer ...a' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \

Returns

Returns a contact object if the request was successful.
JSON

{
    "status": "success",
    "data": "sms unit with all details",
}

If the request failed, an error object will be returned.
JSON

{
    "status": "error",
    "message" : "A human-readable description of the error."
}

View Profile

API Endpoint
Markup

https://app.text.lk/api/v3/me

Example request
PHP

curl -X GET https://app.text.lk/api/v3/me \
-H 'Authorization: Bearer ...a' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \

Returns

Returns a contact object if the request was successful.
JSON

{
    "status": "success",
    "data": "profile data with all details",
}

If the request failed, an error object will be returned.
JSON

{
    "status": "error",
    "message" : "A human-readable description of the error."
}