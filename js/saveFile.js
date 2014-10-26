// Uses "blob" and "html5 <a download></a> attribute" to perform offline download.
// http://blog.darkthread.net/post-2014-03-12-html5-object-url.aspx
function initBtnSaveTofile(){
  var $btn_download = $('#btn_download');
  $btn_download.hide();
  
  $('#btn_saveToFile').bind('click', function(event) {
    // 取消預設的按鈕動作。
    event.preventDefault();

    // 將目前頁面上的 option select 用 逗號 和 換行 分隔，並存入變數中。
    var content = "";
    for(var i=1;i<=TOTAL_STUDENT;i++){
      content += i;
      content += "," + $('#score'+i).val();
      for(var k=0;k<4;k++){
        content += "," + $('#wishList'+i+'_'+k).val();
      }
      content += "\n";
    }

    // 將此變數利用 blob 轉成可下載的物件。
    const MIME_TYPE = 'text/plain';
    var blob  = new Blob([content], {type: MIME_TYPE});
    var blobUrl  = window.URL.createObjectURL(blob);
    
    // 指定 目前的日期時間 為 檔案名稱。
    var currentdate = new Date(); 
    var fileName = "" 
                    + currentdate.getFullYear() 
                    + (currentdate.getMonth()+1)
                    + currentdate.getDate()+"_"
                    + currentdate.getHours()
                    + currentdate.getMinutes()
                    + currentdate.getSeconds()
                    + ".txt";

    $btn_download.attr({ href: blobUrl, download: fileName })
    $btn_download.show();

    /*
    TODO:
      要 Clean blob，避免 memory leak
      a.onclick = function(e) {
        cleanUp(this);
      };
    */
  });
}
