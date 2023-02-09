$(document).ready(()=>{
//for adding active class to a particular nav-item
$("#menu .nav-item").on("click", function() {
    $("#menu .nav-item").removeClass("active");
    $(this).addClass("active");
  });


$(".addNewResource a").click(()=>{
  $(".resource_form").toggle();
});

$(".createClass").click(()=>{
  $(".class_create_form").toggle();
});
$(".createClassbtn").click(()=>{
  $(".class_create_form").toggle();
});

$(".join_btn").click(()=>{
  $(".join_form").toggle();
});

$(".plus_btn").click(()=>{
  $(".join_or_create_form").toggle();
});


/*if($('.err_msg').css('display') === 'block')
{
  setTimeout(function() {
    $(".err_msg").hide('blind', {}, 500 );
  },3500);
  location.reload();
}*/
const Errormsg = async () => {
  await new Promise((resolve)=>setTimeout(() => {
    $(".err_msg").hide('blind', {}, 500 );
      resolve();
  },3000)); 
  location.reload();
}
const Successmsg = async () => {
  await new Promise((resolve)=>setTimeout(() => {
    $(".success_msg").hide('blind', {}, 500 );
      resolve();
  },3000)); 
  location.reload();
}

if($('.err_msg').css('display') === 'block')
{
  Errormsg();
}
if($('.success_msg').css('display') === 'block')
{
  Successmsg();
}

$(window).resize(function() {
  if ($(window).width() <=576) {
      $('#enrolled_course').removeClass('container');
      $('#created_course').removeClass('container');
  }
  else
  {
    $('#enrolled_course').addClass('container');
      $('#created_course').addClass('container');
  }
}).resize(); 

/*window.addEventListener( "pageshow", function ( event ) {
  var historyTraversal = event.persisted || 
                         ( typeof window.performance != "undefined" && 
                              window.performance.navigation.type === 2 );
  if ( historyTraversal ) {
    // Handle page restore.
    window.location.reload();
    $(window).scrollTop(0);
    //document.body.scrollTop=0;
  }
});

/*if (localStorage.getItem("my_app_name_here-quote-scroll") != null) {
  $(window).scrollTop(localStorage.getItem("my_app_name_here-quote-scroll"));
}

$(window).on("scroll", function() {
  localStorage.setItem("my_app_name_here-quote-scroll", $(window).scrollTop());
});*/


//Two way toggler

$(".created_toggle").on("click", function() {
  $(".enrolled_toggle").removeClass("active");
  $(this).addClass("active");
});
$(".enrolled_toggle").on("click", function() {
  $(".created_toggle").removeClass("active");
  $(this).addClass("active");
});

document.querySelector('.cross i').onclick=function()
{
  document.querySelector('.class_create_form').style.display="none";
}



});

let all_files=document.querySelectorAll('.check_files p');
for(let i=0;i<all_files.length;i++)
{
    all_files[i].addEventListener('click',function(){
        let newSrc=document.querySelectorAll('.check_files .hidden_filepath')[i].innerHTML;
        document.getElementById("iframe_file").src='/'+newSrc;
        $(".check_files p").removeClass("file_active");
        $(this).addClass("file_active");
    });
};
let all_comments = document.querySelector(".all_comments");
all_comments.scrollTop = all_comments.scrollHeight;
