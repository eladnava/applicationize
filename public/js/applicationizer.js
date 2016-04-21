$(document).ready(function () {
    "use strict";

    // Handle advanced options toggle click
    $('.advanced-options-toggle').click(function (e) {
        // Cancel default browser navigation
        e.preventDefault();
        
        // Make sure we're not currently generating an extension
        if (!$(this).find('.submit').is(':disabled')) {
            // Toggle the advanced options container's visibility
            $('.advanced-options-container').toggle();
        }
    });

    // Handle applicationize form submit
    $('.applicationize-form').submit(function (e) {
        // Get input URL
        var url = $(this).find('input[name="url"]').val();

        // Try parsing the URL
        var parser = document.createElement('a');
        parser.href = url;

        // Verify host & protocol
        if (! url || url.substring(0, 4) !== 'http' || ! parser.host) {
            alert('Please provide a valid web app URL.\r\nExample: https://www.messenger.com/');
            return e.preventDefault();
        }

        // Grab spinner and submit elements
        var submit = $(this).find('.submit');
        var spinner = $(this).find('.spinner');

        // Hide submit button and show spinner
        submit.hide();
        spinner.show();

        // Wait a few seconds (ugly hack since we don't know when the file has been downloaded)
        setTimeout(function () {
            // Flip the visibility back to normal
            spinner.hide();
            submit.show();
        }, 2500);
    });
});