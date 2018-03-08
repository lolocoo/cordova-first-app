$(function(){
  var myApp = new Framework7();

  // Init slider and store its instance in mySwiper variable
  var mySwiper = myApp.swiper('.swiper-container', {
    pagination:'.swiper-pagination'
  });
 //  });

 $('.list-button').on('click', function () {
   var buttons1 = [
       {
           text: '退出后不会删除任何历史数据',
           label: true
       },
      //  {
      //      text: 'Button1',
      //      bold: true
      //  },
       {
           text: 'Button2',
       }
   ];
   var buttons2 = [
       {
           text: 'Cancel',
           color: 'red'
       }
   ];
   var groups = [buttons1, buttons2];
   myApp.actions(groups);
});


});
