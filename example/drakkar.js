
module.exports = function() {
    this.renderer.plugins.date = function() {
        console.log('THERE');
        return (new Date()).toISOString();
    };
};
