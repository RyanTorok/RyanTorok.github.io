$(document).ready(function () {
    let headerHeight = $("#titleBarWrapper").height();
    let regions = $(".widget");
    let heights = [];
    for (let i = 0; i < regions.length; i++) {
        heights.push(regions.eq(i).prop("offsetTop") - headerHeight);
    }

    var scrollIndex = 0;
    var detectScroll = true;
    var autoView = true;
    var init = true;

    var handleRegionChange = function (index, me) {
	    detectScroll = false;
	    scrollIndex = index;
	    if (autoView) {
            if (index === regions.length - 1) {
                window.scrollTo(0, document.body.scrollHeight);
            } else {
		        regions[scrollIndex].scrollIntoView();
		        //need to scroll enough so the header doesn't block us
		        scrollBy(0, headerHeight * -1);
            }
	    } else {
		    autoView = true;
	    }
	    let time = 400;
	    if (init) {
		    time = 0; 
	    }
	    $( "#scrollBar" ).animate({
		    left: me.offset().left,
		    width: me.width()
	    }, time, function() {
		    // Animation complete.
		    init = false;
	    });
    };

    $(".barMenu").click(function() {
    	const me = $(this);
	    let index = $(this).index();
	    handleRegionChange(index, me);
    });

	$(window).scroll(function() {
		if (detectScroll === false) {
			detectScroll = true;
			return;
		}
		let position = $(window).scrollTop();
		var goToIndex = 0;
		for (var i = 1; i < heights.length; i++) {
			if (position > heights[i]) {
				goToIndex++;
			}
		}
        // If we hit the bottom, always move to the last bar menu, even if its
        // top doesn't reach the top of the window.
        if ((window.innerHeight + $(window).scrollTop()) >= $(document).height())
		{
            goToIndex = heights.length - 1;
        }
		if (scrollIndex !== goToIndex) {
			autoView = false;
			let me = $(".barMenu").eq(goToIndex);
            if (me) {
                let index = me.index();
                handleRegionChange(index, me);
            }
		}
	});
    let url = new URL(window.location);
    let scroll = url.searchParams.get("scroll");
    if (scroll !== undefined && scroll !== null)
        $("#barMenus").children().eq(scroll).click();

    // Prevent text overflowing widget
    $(".widget img").each(function() {
        //$(this).parents().eq(0).css("height", $(this).css("height"));
    });

    init = false;
    $(".barmenu").eq(0).click();
});
