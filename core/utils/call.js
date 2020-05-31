const axios = require('axios');
const settings = require('./settings');

const axiosInstance = axios.create({
    baseURL: settings.countly.baseUrl,
    timeout: 3000,
    headers: {Accept: 'application/json', 'Content-Type': 'application/json'}
});

const sendNotification = async (url, deviceNotificationIds, title, desc, image = null, massageInApp = false) => {
    axiosInstance.post(`i/pushes/create?api_key=${settings.countly.apiKey}`,
        {
            args: {
                type: "message",
                apps: [settings.countly.appId],
                platforms: ["a", "i"],
                messagePerLocale: {
                    default: "Approved, Paid or alarm of start Event",
                    en: desc.en,
                    ar: desc.ar,
                    "default|t": title.en,
                    "en|t": title.en,
                    "ar|t": title.ar,
                },
                url: `crowdedApp://${url}`,
                data: {massageInApp: massageInApp},
                userConditions: {did: {$in: deviceNotificationIds}},
                sound: "default",
                media: image ? image : settings.email_logo,
                source: "api",
                test: false,
                tz: false,
            }
        }
    )
        .then(function (response) {
            console.log("~~~~~~~~~~~~~ pushNotification has been sent response: ", response.data);
        })
        .catch(function (error) {
            console.error("~~~~~~~~~~~~~ pushNotification Failed response:", error);
        });
};

module.exports = {
    sendNotification
};