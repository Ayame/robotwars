// Created by jillvandendriessche on 22/02/17.

function Box(id) {
    this.src = 'images/item.svg';
    this.selected = false;
    this.id = id;
    this.visible = true;

    this.addToHTML();
}

Box.prototype.animate = function () {
    this.$htmlelement.addClass('animateImg');
    this.setVisibility();
    return this;
};

Box.prototype.setVisibility = function(){
    var element = this;
    setInterval(function(){
        element.visible = (parseInt(element.$htmlelement.css('right').replace('px', '')) <= 840);
    },500)
};

Box.prototype.addToHTML = function () {
    $('aside .wrapper').append('<img src="' + this.src + '" alt="Collectible" title="Collectible" id="item-' + this.id + '" />');
    this.$htmlelement = $('#item-' + this.id);
    return this;
};

Box.prototype.moveToStartPosition = function () {
    // this.$htmlelement.css('right','-95px').removeClass('animateImg').addClass('animateImg'); // This makes them turn around and go back, really cool and unexpected!
    this.$htmlelement.removeClass('animateImg');
    void this.$htmlelement[0].offsetWidth; // Some magic I found on https://css-tricks.com/restart-css-animation/
    this.$htmlelement.addClass('animateImg'); console.log('animation ended with position ' + this.$htmlelement.css('right'));
    return this;
};