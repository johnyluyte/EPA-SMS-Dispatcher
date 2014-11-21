// Uses "blob" and "html5 <a download></a> attribute" to perform offline download.
// http://blog.darkthread.net/post-2014-03-12-html5-object-url.aspx
function createDownloadableContent(){
  createDownloadableContentForThisProgram();
  createDownloadableContentFor3F();
  /*
  TODO:
    要 Clean blob，避免 memory leak
    a.onclick = function(e) {
      cleanUp(this);
    };
  */
}

// 輸出成這個教務組要的格式（ Excel 依照號碼大小排序）
function createDownloadableContentFor3F(){

}


// 輸出成這個程式看得懂的格式
function createDownloadableContentForThisProgram(){
  // 將目前頁面上的 option select 用 逗號 和 換行 分隔，並存入變數中。
  var content = "";
  for(var i=1;i<=TOTAL_STUDENT;i++){
    content += i;
    content += "," + $('#score'+i).val();
    for(var k=0;k<=1;k++){
      content += "," + $('#wishList'+i+'_'+k).val();
    }
    // 加上家因
    if($('#homeFirst'+i).is(':checked')){
      content += "," + IS_HOME_FIRST;
    }else{
      content += "," + IS_NOT_HOME_FIRST;
    }
    content += "\n";
  }
  // 將此變數利用 blob 轉成可下載的物件。
  const MIME_TYPE = 'text/plain';
  var blob  = new Blob([content], {type: MIME_TYPE});
  var blobUrl  = window.URL.createObjectURL(blob);

  var fileName = getFileName(".txt");

  var $btn_downloadTXT = $('#btn_downloadTXT');
  $btn_downloadTXT.attr({ href: blobUrl, download: fileName })
}


// 指定 目前的日期時間 為 檔案名稱。
function getFileName(suffix){
  var currentdate = new Date();
  var fileName = ""
                  + currentdate.getFullYear()
                  + fixOneDigit((currentdate.getMonth()+1))
                  + fixOneDigit(currentdate.getDate())
                  + "_"
                  + fixOneDigit(currentdate.getHours())
                  + fixOneDigit(currentdate.getMinutes())
                  + fixOneDigit(currentdate.getSeconds())
                  + suffix;
  return fileName;
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
