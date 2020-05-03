const { googleStaticImage } = require('./utils/map');
const settings = require('./utils/settings');
const interestController = require('./controllers/interest');
const areaController = require('./controllers/area');
const roleController = require('./controllers/role');


// DEV-TEMPORARY
const bankNameController = require('./controllers/bankName');
const BankName = require('./models/BankName');
const Staticpage = require('./models/Staticpage');

const permissionController = require('./controllers/permission');



(async () => {
	console.log("******* single run **********");
	
	// Staticpage.create([{
	// 	alias: 	 'about-us',
	// 	name_en: 'About us',
	// 	name_ar: 'About USS',
	// 	html_en: 'somehtmlhere',
    //     html_ar: 'YOYO',
    //     in_app: true
	// }]);

    googleStaticImage(35.7485728, 51.4080562);
    if (settings.initDataDB) {

        /*const AREA = [
            {
                name_en: "Hawally",
                name_ar: "حولي",
                childs: [
                    {name_en:"Al Bedae",name_ar:"البدع"},
                    {name_en:"Bayan",name_ar:"بيان"},
                    {name_en:"Hawally",name_ar:"حولي"},
                    {name_en:"Hitteen",name_ar:"حطين"},
                    {name_en:"Jabriya",name_ar:"الجابرية"},
                    {name_en:"Maidan Hawally",name_ar:"ميدان حولي"},
                    {name_en:"Mishrif",name_ar:"مشرف"},
                    {name_en:"Mubarak Al Abdullah",name_ar:"مبارك العبدالله"},
                    {name_en:"Rumaithiya",name_ar:"الرميثية"},
                    {name_en:"Salam",name_ar:"السلام"},
                    {name_en:"Salmiya",name_ar:"السالمية"},
                    {name_en:"Salwa",name_ar:"سلوى"},
                    {name_en:"Shaab",name_ar:"الشعب"},
                    {name_en:"Shuhada",name_ar:"الشهداء"},
                    {name_en:"Siddiq",name_ar:"الصديق"},
                    {name_en:"Zahra",name_ar:"الزهراء"}
                ]
            },
            {
                name_en: "Nizek Land",
                name_ar: "نايزك لند",
                childs: [
                    {name_en:"Nizek Land East",name_ar:"نايزك لند ايست"},
                    {name_en:"Nizek Land West",name_ar:"نايزك لند وست"}
                ]
            },
            {
                name_en: "Mubarak Al Kabir",
                name_ar: "مبارك الكبير",
                childs: [
                    {name_en:"Abu Ftaira",name_ar:"أبو فطيرة"},
                    {name_en:"Abu Hasaniya",name_ar:"أبو الحصانية"},
                    {name_en:"Adan",name_ar:"العدان"},
                    {name_en:"Al Mesayel",name_ar:"المسايل"},
                    {name_en:"Coast Strip B",name_ar:"شريط الساحلي ب"},
                    {name_en:"Fintas",name_ar:"الفنطاس"},
                    {name_en:"Funaitees",name_ar:"الفنيطيس"},
                    {name_en:"Messila",name_ar:"المسيلة"},
                    {name_en:"Mubarak Al Kabir",name_ar:"مبارك الكبير"},
                    {name_en:"Qurain",name_ar:"القرين"},
                    {name_en:"Qusour",name_ar:"القصور"},
                    {name_en:"Sabah Al Salem",name_ar:"صباح السالم"},
                    {name_en:"Sabhan Industrial",name_ar:"صبحان الصناعية"},
                    {name_en:"South Wista",name_ar:"جنوب الوسطي"},
                    {name_en:"West Abu Ftaira",name_ar:"غرب ابو فطيرة"},
                    {name_en:"Wista",name_ar:"وسطى"}
                ]
            },
            {
                name_en: "Farwaniya",
                name_ar: "الفروانية",
                childs: [
                    {name_en:"Abbasiya",name_ar:"عباسية"},
                    {name_en:"Abdullah Al Mubarak",name_ar:"عبدالله المبارك"},
                    {name_en:"Abraq Khaitan",name_ar:"أبرق خيطان"},
                    {name_en:"Airport",name_ar:"المطار"},
                    {name_en:"Andalous",name_ar:"الأندلس"},
                    {name_en:"Ardhiya",name_ar:"العارضية"},
                    {name_en:"Ardhiya Small Industrial",name_ar:"العارضية الصناعية"},
                    {name_en:"Ardhiya Storage Zone",name_ar:"عارضية مخازن"},
                    {name_en:"Dhajeej",name_ar:"الضجيج"},
                    {name_en:"Exhibits - South Khaitan",name_ar:"منطقة المعارض جنوب خيطان"},
                    {name_en:"Farwaniya",name_ar:"الفروانية"},
                    {name_en:"Ferdous",name_ar:"الفردوس"},
                    {name_en:"Ishbilya",name_ar:"اشبيليا"},
                    {name_en:"Jaleeb Al Shuyookh",name_ar:"جليب شيوخ"},
                    {name_en:"Khaitan",name_ar:"خيطان"},
                    {name_en:"Omariya",name_ar:"العمرية"},
                    {name_en:"Rabiya",name_ar:"الرابية"},
                    {name_en:"Rai Industrial",name_ar:"الري الصناعيه"},
                    {name_en:"Reggai",name_ar:"الرقعي"},
                    {name_en:"Rehab",name_ar:"الرحاب"},
                    {name_en:"Sabah Al Nasser",name_ar:"صباح الناصر"},
                    {name_en:"Shedadiya",name_ar:"الشدادية"}
                ]
            },
            {
                name_en: "Jahra",
                name_ar: "الجهراء",
                childs: [
                    {name_en:"Abdali",name_ar:"العبدلي"},
                    {name_en:"Amghara",name_ar:"أمغره"},
                    {name_en:"Jahra",name_ar:"الجهراء"},
                    {name_en:"Mutla'",name_ar:"المطلاع"},
                    {name_en:"Naeem",name_ar:"النعيم"},
                    {name_en:"Nasseem",name_ar:"النسيم"},
                    {name_en:"Oyoun",name_ar:"العيون"},
                    {name_en:"Qairawan - South Doha",name_ar:"قيروان جنوب الدوحة"},
                    {name_en:"Qasr",name_ar:"قصر"},
                    {name_en:"Saad Al Abdullah",name_ar:"سعد العبدالله"},
                    {name_en:"Sabiya",name_ar:"الصبيه"},
                    {name_en:"Sheikh Saad Al Abdullah Airport",name_ar:"مطار الشيخ سعد العبدالله"},
                    {name_en:"Sulaibiya",name_ar:"الصليبية"},
                    {name_en:"Sulaibiya Farms",name_ar:"الصليبيه الزراعيه"},
                    {name_en:"Sulaibiya Industrial",name_ar:"الصليبية الصناعيه"},
                    {name_en:"Taima",name_ar:"تيماء"},
                    {name_en:"Waha",name_ar:"الواحة"}
                ]
            },
            {
                name_en: "Kuwait City",
                name_ar: "مدينة الكويت",
                childs: [
                    {name_en:"Abdullah Al Salem",name_ar:"عبدالله السالم"},
                    {name_en:"Adailiya",name_ar:"العديلية"},
                    {name_en:"Al Rai",name_ar:"الري"},
                    {name_en:"Bneid Al Gar",name_ar:"بنيد القار"},
                    {name_en:"Daiya",name_ar:"الدعية"},
                    {name_en:"Dasma",name_ar:"الدسمة"},
                    {name_en:"Dasman",name_ar:"دسمان"},
                    {name_en:"Doha",name_ar:"الدوحة"},
                    {name_en:"Faiha",name_ar:"الفيحاء"},
                    {name_en:"Ghornata",name_ar:"غرناطة"},
                    {name_en:"Jaber Al Ahmad",name_ar:"جابر الأحمد"},
                    {name_en:"Kaifan",name_ar:"كيفان"},
                    {name_en:"Khaldiya",name_ar:"الخالدية"},
                    {name_en:"Kuwait City",name_ar:"مدينة الكويت"},
                    {name_en:"Mansouriya",name_ar:"المنصورية"},
                    {name_en:"Mirqab",name_ar:"المرقاب"},
                    {name_en:"Nahdha",name_ar:"النهضه"},
                    {name_en:"Nuzha",name_ar:"النزهة"},
                    {name_en:"Qadsiya",name_ar:"القادسية"},
                    {name_en:"Qayrawan",name_ar:"القيروان"},
                    {name_en:"Qibla",name_ar:"القبلة"},
                    {name_en:"Qortuba",name_ar:"قرطبة"},
                    {name_en:"Rawda",name_ar:"الروضة"},
                    {name_en:"Salhiya",name_ar:"الصالحية"},
                    {name_en:"Sawaber",name_ar:"الصوابر"},
                    {name_en:"Shamiya",name_ar:"الشامية"},
                    {name_en:"Sharq",name_ar:"شرق"},
                    {name_en:"Shuwaikh",name_ar:"الشويخ"},
                    {name_en:"Sulaibikhat",name_ar:"الصليبيخات"},
                    {name_en:"Surra",name_ar:"السرة"},
                    {name_en:"West Sulaibikhat",name_ar:"غرب الصليبيخات"},
                    {name_en:"Yarmouk",name_ar:"اليرموك"}
                ]
            },
            {
                name_en: "Ahmadi",
                name_ar: "الأحمدي",
                childs: [
                    {name_en:"Abu Halifa",name_ar:"ابوحليفة"},
                    {name_en:"Al Ahmadi",name_ar:"الأحمدي"},
                    {name_en:"Ali Sabah Al Salem",name_ar:"علي صباح السالم"},
                    {name_en:"Dhaher",name_ar:"الظهر"},
                    {name_en:"East Al Ahmadi",name_ar:"شرق الاحمدي"},
                    {name_en:"Egaila",name_ar:"العقيلة"},
                    {name_en:"Fahad Al Ahmed",name_ar:"فهد الاحمد"},
                    {name_en:"Fahaheel",name_ar:"الفحيحيل"},
                    {name_en:"Fintas",name_ar:"الفنطاس"},
                    {name_en:"Hadiya",name_ar:"هدية"},
                    {name_en:"Jaber Al Ali",name_ar:"جابر العلي"},
                    {name_en:"Khiran",name_ar:"الخيران"},
                    {name_en:"Magwa",name_ar:"مقوع"},
                    {name_en:"Mahboula",name_ar:"المهبولة"},
                    {name_en:"Mangaf",name_ar:"المنقف"},
                    {name_en:"Mina Abdullah",name_ar:"ميناء عبدالله"},
                    {name_en:"Mina Al Ahmadi",name_ar:"ميناء الاحمدي"},
                    {name_en:"Riqqa",name_ar:"الرقة"},
                    {name_en:"Sabah Al Ahmad City",name_ar:"مدينة صباح الأحمد"},
                    {name_en:"Sabahiya",name_ar:"الصباحية"},
                    {name_en:"Shuaiba Port",name_ar:"ميناء الشعيبة"},
                    {name_en:"Wafra",name_ar:"الوفره"}
                ]
            },
            {
                name_en: "Sam",
                name_ar: "السام",
                childs: [
                    {name_en:"Sam Area",name_ar:"السام المكان"},
                    {name_en:"Sam Second Area",name_ar:"السام الثاني المكان"}
                ]
            }
        ]
        //remove All Area
        areaController.remove({})
            .then(() => {
                areaController.add(AREA)
                    .then(area => {
                        console.log("initDataDB>>>>>>>>>>>>>>>>> ", area.length + ' Area has been successfully added!')
                    })
                    .catch(err => {
                        console.error("Area Add Catch err:", err)
                    })
            })
            .catch(err => {
                console.error("Area Remove Catch err:", err)
            })*/


    }
    // InterestController.add({title: 'Sports', image: 'sport.jpg'})
    //     .then(interestId => {
    //         console.info("*** interest added interest_id: %s", interestId);
    //         /*SessionController.add({device: deviceId,})
    //             .then((session) => {
    //                 console.info("*** session added _session: %s", session);
    //                 const token = jwtRun.sign({deviceId: deviceId, sessionId: session._id});
    //                 session.setToken(token);
    //                 res.send({token})
    //             })
    //             .catch(err => {
    //                 console.error("session Add Catch err:", err)
    //                 new NZ.Response(null, err.message, err.code || 500).send(res);
    //             })*/
    //     })
    //     .catch(err => {
    //         console.error("Interest Add Catch err:", err)
    //         new NZ.Response(null, err.message, err.code || 500).send(res);
    //     })


    /* !-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-! */
    /* !-!-!Seed BankName model with fade data-!-!-! */
    /* !-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-! */
    BankName.find({})
        .then(bankNames => {
            if (bankNames.length === 0) {
                console.log('...Attempting to seed BankName Model.');
                return bankNameController.add([
                    {
                        "name_en": "Alpha Bank",
                        "name_ar": "بنك ألفا"
                    },
                    {
                        "name_en": "Beta Bank",
                        "name_ar": "بنك بيتا"
                    },
                    {
                        "name_en": "Gamma Bank",
                        "name_ar": "بنك جاما"
                    },
                    {
                        "name_en": "Delta Bank",
                        "name_ar": "بنك الدلتا"
                    }
                ])
            } else {
                return false;
            }
        })
        .then(insertReport => {
            if (insertReport === false) {
                console.log('*** BankName model is already feed.');
            } else {
                console.log('*** BankName model seed done.');
            }
        })
        .catch(err=>{
            console.error('Oops!',err);
        });

    /*Init Permissions*/
    permissionController.get({})
        .then(permissions => {
            if (permissions.length === 0) {
                console.log('...Attempting to seed Permission Model.');
                const initPermission = [
                    {title: "Admin",        access: 143},
                    // {title: "Area",         access: 143},
                    {title: "User", access: 175},
                    {title: "Bank",    access: 143},
                    {title: "Device",   access: 143},
                    {title: "Event",        access: 175}, //All
                    {title: "Interest",     access: 143},
                    {title: "Organization", access: 143},
                    {title: "Role",         access: 143},
                    {title: "Transaction",  access: 167},
                    {title: "PARTICIPANTS",   access: 166}, // All
                ];
                return permissionController.add(initPermission)
                    .catch(err => {
                        console.log("!!!Permission many save failed: ", err);
                        throw err
                    })
            } else {
                return false;
            }
        })
        .then(permissionReport => {
            if (permissionReport === false) {
                console.log('*** Permission model is already feed.');
            } else {
                console.log('*** Permission model seed done.');
            }
        })
        .catch(err=>{
            console.error('Oops!',err);
        });

    /* !-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-! */
    /* !-!-!-!-!-!-!-DEV-TEMPORARY-!-!-!-!-!-!-!-!-! */
    /* !-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-! */




})();

console.log('SINGLE RUN');