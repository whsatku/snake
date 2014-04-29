var Block = cc.Sprite.extend({
    ctor: function( x1, y1, x2, y2 ) {
        this._super();
        this.setTextureRect(cc.rect( 0, 0, x2-x1, y2 - y1 ));
        this.setColor(cc.RED);
        this.setOpacity( 80 );
        this.setAnchorPoint( cc.p( 0, 0 ) );
        this.x = x1;
        this.y = y1;
        this.setPosition( cc.p( this.x , this.y ) );
    },
    
    getTopY: function() {
        return cc.rectGetMaxY( this.getBoundingBoxToWorld() );
    },

    hitTop: function( oldRect, newRect ) {
        var brect = this.getBoundingBoxToWorld();
        if ( cc.rectGetMinY( oldRect ) >= cc.rectGetMaxY( brect ) ) {
            var uRect = cc.rectUnion( oldRect, newRect );
            return cc.rectIntersectsRect( uRect, brect );
        }
        return false;
    },

    onTop: function( rect ) {
        var brect = this.getBoundingBoxToWorld();
        var bminx = cc.rectGetMinX( brect );
        var bmaxx = cc.rectGetMaxX( brect );
        var minx = cc.rectGetMinX( rect );
        var maxx = cc.rectGetMaxX( rect );
        return ( minx <= bmaxx ) && ( bminx <= maxx );
    }
});