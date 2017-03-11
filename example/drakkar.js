
module.exports = function() {
    this.renderer.plugins.date = function() {
        return (new Date()).toISOString();
    };
};
