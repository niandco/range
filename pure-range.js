/* 
 * PURE RANGE
 *
 * @version: 0.0.1
 * @author: niandco <https://github.com/niandco>
 * @license: GPLv3
 *
 */
 
import event from '../event.js';//TODO
import node from '../node.js';//TODO

(function( win, doc ){

	if( typeof win.pureRange === 'function' ){
		return;
	
	}

win.pureRange = function( source, options ){
	var dragging = false;

	if( !source ){
		return;

	}

	if( typeof options !== 'object' ){
		options = {};

	}

	function sanitizeValue( value ){

		if( typeof value !== 'number' && typeof value !== 'string' ){
			return 0;

		}

		if( typeof ( value = parseFloat( value ) ) !== 'number' || isNaN( value ) ){
			return 0;

		}
		return value;

	}

	function initDragger( dragger, value, dflt ){
		var width, dwidth;

		if( !node( dragger ).isNode() || !( width = node( dragger.parentNode ).width(0) ) ){
			return false;

		}

		if( ( value = sanitizeValue( value ) ) === 0 && ( dflt = sanitizeValue( dflt ) ) !== 0 ){
			value = dflt;

		}
		dwidth = ( dwidth = sanitizeValue( node( dragger ).width(0) ) ) > 0 ? dwidth : 0;
		width = width - dwidth;
		value = parseInt( value * width );
		dragger.style.left = value + 'px';
		return value;

	}

	function onDecInc( ev, ui, data, increase ){
		e.preventDefault();
		var val, min, max, step;

		if( typeof data !== 'object' || !node( data.source ).isNode() || !node( data.dragger ).isNode() ){
			return false;

		}
		min = sanitizeValue( data.source.getAttribute( 'min' ) );
		max = ( max = sanitizeValue( data.source.getAttribute( 'max' ) ) ) > min ? max : 360;
		step = ( step = sanitizeValue( data.source.getAttribute( 'step' ) ) ) > 0 ? step : 1;

		val = ( val = sanitizeValue( data.source.value ) ) > min && val <= max ? val : min;
		val = Number( ( increase ? val + step : val - step ).toFixed( 2 ) );
		val = val < min ? min : ( val > max ? max : val );
		data.source.value = val;
		initDragger( data.dragger, val, min );
		data.value = val;

		if( typeof options.change === 'function' ){
			options.change( ev, ui, data );

		}
		return true;

	}

	function onrange( ev, ui, data ){
		ev.preventDefault();
		ev.stopPropagation();
		var x, width, dwidth, val, delta, per, min, max, step;

		if( ( ev.type !== 'mousemove' || !dragging ) && ev.type !== 'click' ){
			return;

		}

		if( !( width = node( data.range ).width(0) ) || !( x = data.range.getBoundingClientRect().left ) ){
			return;

		}
		min = sanitizeValue( data.source.getAttribute( 'min' ) );
		max = ( max = sanitizeValue( data.source.getAttribute( 'max' ) ) ) > min ? max : 360;
		step = ( step = sanitizeValue( data.source.getAttribute( 'step' ) ) ) > 0 ? step : 1;
		dwidth = ( dwidth = sanitizeValue( node( data.dragger ).width(0) ) ) > 0 ? dwidth : 0;

		if( typeof ( delta = parseInt( ev.pageX - x ) ) !== 'number' || isNaN( delta ) ){
			delta = 0;

		}
		delta = delta - ( dwidth / 2 );
		width = width - dwidth;

		if( delta > width ){
			delta = width;

		}

		if( delta < 0 ){
			delta = 0;

		}
		data.dragger.style.left = parseInt( delta ) + 'px';
		per = ( ( delta ) / ( width || 1 ) );
		val = step * Math.round( per * ( max - min ) / step ) + min;
		val = Number( (val).toFixed(2) );
		data.source.value = val;
		data.value = val;

		if( typeof options.change === 'function' ){
			options.change( ev, ui, data );

		}

	}

	function onstart( ev, ui, data ){
		ev.preventDefault();

		if( typeof data !== 'object' || !node( data.source ).isNode() || !node( data.range ).isNode() ){
			return;

		}

		if( typeof options.start === 'function' ){
			options.start( ev, ui, data );

		}
		data.value = sanitizeValue( data.source.value );
		dragging = true;
		
	}

	function onstop( ev, ui ){
		ev.preventDefault();

		if( typeof options.stop === 'function' ){
			options.stop( ev, ui );

		}
		dragging = false;
		
	}

	function onincrease( ev, ui, data ){
		const _on = onDecInc( ev, ui, data, true );

		if( !_on ){
			return;

		}

		if( typeof options.increase === 'function' ){
			options.increase( ev, ui, data );

		}

	}

	function ondecrease( ev, ui, data ){
		const _on = onDecInc( ev, ui, data, false );

		if( !_on ){
			return;

		}

		if( typeof options.decrease === 'function' ){
			options.decrease( ev, ui, data );

		}

	}

	function create( _ui ){
		const wrap = _ui.parentNode;
		const data = {};
		var range, dragger, dec, inc;

		if( !wrap ){
			return;

		}
		range = document.createElement( 'div' );
		range.className = 'comet-eRange';

		dragger = document.createElement( 'button' );
		dragger.className = 'comet-eRDragger';
		range.appendChild( dragger );

		data.source = _ui;
		data.range = range;
		data.dragger = dragger;

		if( options.buttons ){
			dec = document.createElement( 'button' );
			dec.className = 'comet-eRDecrease comet-button';
			dec.innerHTML = '-';

			inc = document.createElement( 'button' );
			inc.className = 'comet-eRIncrease comet-button';
			inc.innerHTML = '+';

			wrap.appendChild( dec );
			wrap.appendChild( range );
			wrap.appendChild( inc );
			data.decrease = dec;
			data.increase = inc;

			event( 'click', dec, ondecrease, data );
			event( 'click', inc, onincrease, data );

		}else{
			wrap.appendChild( range );

		}
		initDragger( dragger, _ui.value, _ui.getAttribute( 'max' ) );
		event( 'mousedown', dragger, onstart, data );
		event( 'click mousemove', range, onrange, data );

	}

	if( node( source ).isNode() ){
		create( source );

	}else if( source !== document && source !== window && typeof source === 'object' && source.length > 0 ){

		for( x in source ){

			if( !node( source[x] ).isNode() ){
				continue;

			}
			create( source[x] );
		}

	}else{
		return;

	}
	event( 'mouseup', document.documentElement, onstop );

}

})( window, document );
