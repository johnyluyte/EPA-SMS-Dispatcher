/*
安全機制及基本概念請參考這篇
http://www.wilmott.com/messageview.cfm?catid=10&threadid=94008
*/

// 讀取學生志願檔案(txt file)。
function initBtnLoadFromFile(){
  document.getElementById('studentChangeFileInput').addEventListener('change', loadFromFile, false);
  
  function loadFromFile(evt) {
    var file = evt.target.files[0];   
    if (file) {
      var fileReader = new FileReader();
      fileReader.onload = function(e) {           
        var content = fileReader.result;
        var lines = content.split('\n');
        var linesLength = lines.length;
        for(var i=0;i<linesLength;i++){       
          var words = lines[i].split(',');
          fillSelectOptions(i+1,words); // i+1 Because StudentId starts from 1, not 0
        }
      }
      fileReader.readAsText(file);
    } else { 
      alert("Failed to load file");
    }
  }

  // 填入 select 中，格式依序為 0:學號 1:分數 2:戶籍地 3:第一志願 4:第二志願 5:第三志願
  function fillSelectOptions(studentID, words){
    $("#score"+ studentID).val( words[1] );
    var length = words.length;

    // 輸入的格式有Ａ、Ｂ兩種可能：
    // Ａ（基本資料）： [0]學號、[1]分數、[2]戶籍地
    // Ｂ（預排完成）： [0]學號、[1]分數、[2]戶籍地、[3]志願、[4]家因

    // We fetched the [newline] at the end of the txt file, ignore it.
    if(length==1){
      return;
    }

    // 資料格式Ｂ：處理 [志願、家因]
    else if(length>3){
      $("#wishList"+ studentID + '_1').val( words[3] );
      // TODO:記得處理家因
    }

    // 處理 [學號、分數、戶籍地]
    // [2] 為戶籍地資料，可能會以 台北市大安區 的方式呈現，我們只需要 台北市，故只取前三個字，其他縣市依此類推
    var firstThree = words[2].substring(0,3);
    $("#wishList"+ studentID + '_0').val( firstThree );
  }

}
