// Error middleware
module.exports = function error() {
    // Return generator function
    return function* error(next) {
        try {
            yield next;
        } catch (err) {
            // Set response status code
            this.status = err.status || 500;
            this.body = { error: err.message || 'An unexpected error occurred.' };

            // Log to console
            console.log('Unhandled exception', err);
            
            // Emit app-wide error
            //this.app.emit('error', err, this);
        }
    }
};