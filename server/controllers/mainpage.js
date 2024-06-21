exports.getHomePage = (req, res, next) => {
    console.log(req.url)
    res.sendFile(`${req.url}.html`, { root: 'views' });

}