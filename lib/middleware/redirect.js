module.exports = function httpsRedirect() {
    // Redirect users to HTTPS endpoint
    return function* (next) {
        // Didn't request 'https://' endpoint?
        if (this.protocol !== 'https' && this.hostname !== 'localhost') {
            // Redirect to HTTPS endpoint with same path
            return this.redirect('https://' + this.host + this.url);
        }
        
        // Execute downstream middleware
        yield next;
    };
};