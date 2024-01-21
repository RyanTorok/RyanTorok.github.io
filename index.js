let loginState = 0;
let loginBlock;
$(document).ready(function () {
    console.log($("#title").css("font-size"));

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
});

