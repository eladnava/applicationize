// Error middleware
module.exports = function error()
{
	// Return generator function
	return function *error(next) {
		try {
			yield next;
		} catch (err) {
			// Set response status code
			this.status = err.status || 500;
            
            // Escape single quotes
            err.message = err.message.replace(/'/g, "\\'");
            
            // Dirty hack - display error in alert dialog navigate back when its dismissed
			this.body = "<script>alert('" + ( err.message || 'Unknown error. Please contact us at applicationizeme@gmail.com.' ) + "');window.history.back();</script>";
		
			// Emit app-wide error
			//this.app.emit('error', err, this);
		}
	}
};