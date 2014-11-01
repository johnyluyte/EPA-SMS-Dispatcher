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
      for(var k=0;k<=1;k++){
        content += "," + $('#wishList'+i+'_'+k).val();
      }
      // TODO: 記得加上家因
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
                    + fixOneDigit((currentdate.getMonth()+1))
                    + fixOneDigit(currentdate.getDate())
                    + "_"
                    + fixOneDigit(currentdate.getHours())
                    + fixOneDigit(currentdate.getMinutes())
                    + fixOneDigit(currentdate.getSeconds())
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

// 如果現在時間是 2014/11/1, 21:07, 02
// 可能我們會得到 2014111_2172
// 而我們想要的是 20141101_210702 才對
// 這個 function 可以 fix 上述問題。
function fixOneDigit(x){
  var result = x;
  if(result<10){
    result = "0" + result;
  }
  return result;
}
