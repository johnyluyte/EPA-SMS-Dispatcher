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

    if(length<4){
      // We fetched the [newline] at the end of the txt file, ignore it.
      if(length==1){
        return;
      }

      // [2] 為戶籍地資料，以 台北市大安區 的方式呈現，我們只需要 台北市，故只取前三個字，其他縣市依此類推
      var firstThree = words[2].substring(0,3);
      // 此時我們得到的是 台北市(shortName) 的形態
      // 接下來我們要將其轉換成 TaipeiCity(englishName) 的形態
      // TODO: 這邊改 hash 會比較好
      for(var i=0;i<regionDatas.length;i++){
        if(firstThree==regionDatas[i].shortName){
          firstThree=regionDatas[i].englishName;
        }
      }
      // 別忘記 wishList50_0 指的是 第50號同學的戶籍地。 
      $("#wishList"+ studentID + '_0').val( firstThree );
    }else{
      // 有幾個欄位就讀取進幾個欄位，基本上是 [0][1][2][3](基本資料+第一志願) 到 [5](三個志願)
      // 由於 input file 的 [3] 到 [5] 欄位已經是 TaipeiCity(englishName) 的形態
      // 故這裡不需做任何轉換
      for(var i=1;i<=length;i++){
        $("#wishList"+ studentID + '_' + (i-2)).val( words[i] );
      }
    }
  }

}
