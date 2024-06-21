const sequelize = require('../utils/database')
const { Op } = require('sequelize');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')




function generateHash(password) {
    return bcrypt.hash(password, bcrypt.genSaltSync(8));//genSaltSync randomizes the password 8 times 
}

function generateAccessToken(id, phone, isPremium, name) {
    return jwt.sign(
        {
            userId: id,
            phone: phone,
            isPremium: isPremium,
            name: name
        }, process.env.TOKEN_SECRET)
}


// exports.postCreateUser = async (req, res, next) => {
//     const name = req.body.name;
//     const email = req.body.email;
//     const phone = req.body.phone;

//     try {
//         const hashedPassword = await generateHash(req.body.password);

//         // **Error handling before User.create:**
//         const existingUser = await User.findOne({
//             where: {
//                 [Op.or]: [
//                     { email: email }, // Check for existing email
//                     { phone: phone }, // Check for existing phone
//                 ],
//             },
//         });

//         if (existingUser) {
//             const duplicateField = existingUser.email === email ? 'email' : 'phone';
//             let errorMessage;
//             if (duplicateField === 'email') {
//                 errorMessage = 'Email already exists';
//             } else {
//                 errorMessage = 'Phone number already exists';
//             }
//             res.status(403).send('Account with this Email or Phone already exists');
//             // throw new Error(errorMessage); // Throw a custom error for clarity
//         }

//         else {
//             const user = await User.create({
//                 name,
//                 phone,
//                 email,
//                 password: hashedPassword,

//             });
//             console.log("Created User");
//             res.json({ message: "Signed Up Successfully" });
//        }
//     } catch (err) {

//         console.error(err);
//         if (err.name !== 'SequelizeUniqueConstraintError') {
//             // Redundant in this case, but included for completeness
//             res.status(500).json({ error: err.message });
//         }

//     }
// };

exports.postCreateUser = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;

    try {
        const hashedPassword = await generateHash(req.body.password);

        // **Error handling before User.create:**
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: email }, // Check for existing email
                    { phone: phone }, // Check for existing phone
                ],
            },
        });

        if (existingUser) {
            const duplicateField = existingUser.email === email ? 'email' : 'phone';
            let errorMessage;
            if (duplicateField === 'email') {
                errorMessage = 'Email already exists';
            } else {
                errorMessage = 'Phone number already exists';
            }
            res.status(403).send('Account with this Email or Phone already exists');
            // throw new Error(errorMessage); // Throw a custom error for clarity
        }

        else {
            const user = await User.create({
                name,
                phone,
                email,
                password: hashedPassword,
                isloggedIn: false

            });
            console.log("Created User");
            res.json({ message: "Signed Up Successfully" });
        }
    } catch (err) {

        console.error(err);
        if (err.name !== 'SequelizeUniqueConstraintError') {
            // Redundant in this case, but included for completeness
            res.status(500).json({ error: err.message });
        }

    }
};

function validPassword(password, dbPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, dbPassword, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}



// exports.postLoginUser = (req, res, next) => {
//     const email = req.body.email;
//     const password = req.body.password;

//     User.findOne({
//         where: {
//             email: email,
//         }
//     })
//         .then((user) => {
//             if (!user) {
//                 return res.status(404).json({ success: false, message: 'User not found' });
//             }

//             validPassword(password, user.password)
//                 .then((isValid) => {
//                     if (isValid) {
//                         // req.session=user
//                         console.log(user.id)
//                         // console.log(req.session.name)
//                         isPremium = user.ispremiumuser
//                         phone = user.phone
//                         return res.status(200).json({ success: true, token: generateAccessToken(user.id, user.phone, user.isPremium, user.name), isPremium: isPremium, phone: phone });
//                     } else {
//                         res.status(401).json({ success: false, message: 'Invalid password. User not authorized' });//changed
//                     }
//                 })
//                 .catch((error) => {
//                     console.error(error);
//                     res.status(500).json({ success: false, message: 'Internal Server Error' });
//                 });
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).json({ success: false, message: 'Internal Server Error' });
//         });
// };



exports.postLoginUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        where: {
            email: email,
        }
    })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            validPassword(password, user.password)
                .then((isValid) => {
                    if (isValid) {
                        // Update isLoggedIn before sending response
                        return user.update({ isloggedIn: true })
                            .then((updatedUser) => {
                                const isPremium = updatedUser.ispremiumuser;
                                const phone = updatedUser.phone;
                                const token = generateAccessToken(updatedUser.id, phone, isPremium, updatedUser.name);

                                return res.status(200).json({
                                    success: true,
                                    token,
                                    isPremium: isPremium,
                                    name: updatedUser.name,
                                    username: updatedUser.username,
                                });
                            })
                            .catch((error) => {
                                console.error(error);
                                res.status(500).json({ success: false, message: 'Internal Server Error' });
                            });
                    } else {
                        res.status(401).json({ success: false, message: 'Invalid password. User not authorized' });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        });
};



exports.getOnlineUsers = (req, res, next) => {
    User.findAll({
        where: {
            isloggedIn: true
        },
        attributes:['id','name']
    }).then((users) => {
        res.json({ users: users })
    }).catch(err => res.send(err))
}


exports.getLogoutUser = (req, res, next) => {
    const userId = req.user.id
    User.update({
        isloggedIn: false
    }, {
        where: {
            id: userId
        }
    }).then(() => {
        res.send('Logged Out Successfully!')
    }).catch((err) => {
        res.send(err)
    })
}


exports.getFindUsers = async (req, res, next) => {
    try {
        const searchQuery = req.query.searchQuery;

        // Find users where either email or phone matches the searchQuery
        const users = await User.findOne({
            where: {
                [Op.or]: [
                    { email: searchQuery },
                    { phone: searchQuery }
                ]
            },
            attributes: [
                'id',
                'name'
            ]
        });

        res.json(users);
    } catch (error) {
        console.error('Error finding users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};