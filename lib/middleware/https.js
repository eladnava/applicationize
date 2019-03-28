module.exports = function httpsRedirect() {
    // Redirect users to HTTPS endpoint
    return function* (next) {
        // Insecure request and requested home page (/)?
        if (this.headers['x-forwarded-proto'] == 'http') {
            // Redirect to HTTPS endpoint with same path
            return this.redirect('https://' + this.host + this.url);
        }
        
        // Execute downstream middleware
        yield next;
    };
};