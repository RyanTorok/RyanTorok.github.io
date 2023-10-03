let loginState = 0;
let loginBlock;
let init = true;
$(document).ready(function () {

    // Alt text switches

    $("#boeing_19_more").click(function() {
        $("#boeing_text").css("display", "none");
        $("#boeing_alt_19").css("display", "");
    });                           

    $("#boeing_19_back").click(function () {
        $("#boeing_alt_19").css("display", "none");
        $("#boeing_text").css("display", "");
    });
    $("#boeing_21_more").click(function() {
        $("#boeing_text").css("display", "none");
        $("#boeing_alt_21").css("display", "");
    });                           

    $("#boeing_21_back").click(function () {
        $("#boeing_alt_21").css("display", "none");
        $("#boeing_text").css("display", "");
    });
    $("#boeing_alt_19").css("display", "none");
    $("#boeing_alt_21").css("display", "none");

    $("#sc_more").click(function() {
        $("#academic_text").css("display", "none");
        $("#academic_alt_sc").css("display", "");
    });                           

    $("#sc_back").click(function () {
        $("#academic_alt_sc").css("display", "none");
        $("#academic_text").css("display", "");
    });
    $("#csr_more").click(function() {
        $("#academic_text").css("display", "none");
        $("#academic_alt_csr").css("display", "");
    });                           

    $("#csr_back").click(function () {
        $("#academic_alt_csr").css("display", "none");
        $("#academic_text").css("display", "");
    });
    $("#academic_alt_sc").css("display", "none");
    $("#academic_alt_csr").css("display", "none");
    

    $("#ta_more").click(function () {
        $("#ta_text").css("display", "none");
        $("#ta_text_alt").css("display", "");
    });
    
    $("#ta_back").click(function () {
        $("#ta_text_alt").css("display", "none");
        $("#ta_text").css("display", "");
    });
    $("#ta_text_alt").css("display", "none");

    $("#dcl_more").click(function () {
        $("#misc_text").css("display", "none");
        $("#misc_alt_dcl").css("display", "");
        document.getElementById("misc_img").setAttribute("src", "dcl_logo.png");
    });
    $("#dwg_more").click(function () {
        $("#misc_text").css("display", "none");
        $("#misc_alt_dwg").css("display", "");
        document.getElementById("misc_img").setAttribute("src", "dwg.jpg");
    });
    $("#cello_more").click(function () {
        $("#misc_text").css("display", "none");
        $("#misc_alt_cello").css("display", "");
    });
    $("#comp_more").click(function () {
        $("#misc_text").css("display", "none");
        $("#misc_alt_comp").css("display", "");
        document.getElementById("misc_img").setAttribute("src", "cib_cropped.png");
    });
    $(".cib_more").click(function () {
        $("#misc_text").css("display", "none");
        $("#misc_alt_comp").css("display", "none");
        $("#misc_alt_cib").css("display", "");
        document.getElementById("misc_img").setAttribute("src", "cib_cropped.png");
    });
    

    $(".misc_back").click(function () {
        $("#misc_alt_dcl").css("display", "none");        
        $("#misc_alt_dwg").css("display", "none");
        $("#misc_alt_cello").css("display", "none");
        $("#misc_alt_comp").css("display", "none");
        $("#misc_alt_cib").css("display", "none");
        $("#misc_text").css("display", "");
        // If we reset to the main view, don't remember we were in a section detail.
        $(".cib_sec_back").eq(0).click();
        document.getElementById("misc_img").setAttribute("src", "cello.JPG")
    });
    
    $("#misc_alt_dcl").css("display", "none");
    $("#misc_alt_dwg").css("display", "none");
    $("#misc_alt_cello").css("display", "none");
    $("#misc_alt_comp").css("display", "none");
    $("#misc_alt_cib").css("display", "none");

    $(".cib_alt").css("display", "none");
    $(".cib_sec").click(function () {
        $("#cib_sections").css("display", "none");
        $(".cib_alt").css("display", "none");
        $("#alt_cib_" + ($(this).index() / 2 + 1)).css("display", "");
    });

    $(".cib_sec_back").click(function () {
        $(".cib_alt").css("display", "none");
        $("#cib_sections").css("display", "");
    });
    
let regions = [
	document.getElementById("general"),
	document.getElementById("industry"),
	document.getElementById("academic"),
    document.getElementById("teaching"),
	document.getElementById("misc")
];

let headerHeight = $("#titleBarWrapper").height();
let heights = [];
for (let i = 0; i < regions.length; i++) {
  heights.push(regions[i].offsetTop - headerHeight);
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
		let position = document.body.scrollTop;
		var goToIndex = 0;
		for (let i = 1; i < heights.length; i++) {
			if (position > heights[i]) {
				goToIndex++;
			}
		}
        // If we hit the bottom, always move to the last bar menu, even if its
        // top doesn't reach the top of the window.
        if ((window.innerHeight + document.body.scrollTop) >= $(document).height())
		{
            goToIndex = heights.length - 1;
        }
		if (scrollIndex !== goToIndex) {
			autoView = false;
			$(".barmenu").eq(goToIndex).click();
		}
	});
    let url = new URL(window.location);
    let scroll = url.searchParams.get("scroll");
    if (scroll !== undefined && scroll !== null)
        $("#barMenus").children().eq(scroll).click();

    init = false;
    $(".barmenu").eq(0).click();

    

});

