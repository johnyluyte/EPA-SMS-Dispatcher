function initBtnStartAlgo(){
  $('#btn_startDispatch').bind('click', function(event) {
    event.preventDefault();
    initAlgo();
    createResultPanel("div_resultPanel");
    doRound();
    printRound("resultRegion");
    printResultPersonal("resultPersonal");
    createDownloadableContent();
  });
}


// 初始化變數、將 html 清空
function initAlgo(){
  // 有時會發生役男進來後，才臨時驗退的情形，我們會在其分數欄位填入 "NA" ，在算平均成績時不把他算進去
  // 注意這裡只是預設值，當程式執行時，此預設值會被算出的值取代
  // Fixed: 2014, Dec, 11
  var not_here_student = 0;

  students = new Array();
  avgScore = 0.0;
  for(x in regionDatas){
    regionDatas[x].queue = new Array();
    regionDatas[x].resultArray = new Array();
  }

  for(var i=1;i<=TOTAL_STUDENT;i++){
    var student = new Student();
    student.id = i;
    student.score = $('#score'+i).val();
    student.home = $('#wishList'+i+'_0').val();
    student.wish1 = $('#wishList'+i+'_1').val();
    student.result = NO_REGION_RESULT;
    student.homeFirst = $('#homeFirst'+i).is(':checked');
    // Add to lists
    students[i-1] = student;

    // 處理臨時被驗退的
    if($('#score'+i).val()==="NA"){
      students[i-1].result = "NA"; // 要給予跟 NO_REGION_RESULT 不一樣的值
      not_here_student++;
      continue;
    }

    // parserInt() used to cause lost of digits. Fixed: 2014, Oct 29
    avgScore += parseFloat(student.score);
  }
  avgScore = avgScore/(TOTAL_STUDENT-not_here_student);
  var size = Math.pow(10, 2);
  avgScore = Math.round(avgScore * size) / size;
}


// 畫出 平均分數、Round1、Round2、Round3、分發結果(依個人)的那個 nav-tabs
function createResultPanel(printToDivID){
  var str = '<div class="panel panel-info">';
  str += '<div class="panel-heading">';
  str += '<h3 class="panel-title">第 ' + WHAT_T + ' 梯 預排結果 ( 平均分數：'+avgScore+' )</h3>';
  str += '</div>';
  str += '<div class="panel-body" id="div_dispatchResult">';
  str += '<ul class="nav nav-tabs">';
  str += '<li class="active"><a href="#resultRegion" data-toggle="tab">地區</a></li>';
  str += '<li><a href="#resultPersonal" data-toggle="tab">個人</a></li>';
    // color block 色塊
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.typeHome + ';"></canvas> 家因</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.type1 + ';"></canvas> 高均+戶籍</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.type2 + ';"></canvas> 高均+非戶籍</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.type3 + ';"></canvas> 低均+戶籍地</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.type4 + ';"></canvas> 低均+非戶籍</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.typeKicked + ';"></canvas> 被擠掉</li>';
  str += '</ul>';
  str += '<div id="resultTabContent" class="tab-content">';
  str += '  <div class="tab-pane fade active in" id="resultRegion"></div>';
  str += '  <div class="tab-pane fade" id="resultPersonal"></div>';
  str += '</div>';
  str += '</div>';
  str += '<div class="panel-fotter">';
  str += '  <div class="btn-group btn-group-justified">';
  str += '    <a href="" class="btn btn-primary" id="btn_downloadTXT">下載程式可讀取的格式(.txt)</a>';
  str += '    <a href="" class="btn btn-info" id="btn_downloadCSVRegion">給輔導組(照地區.csv)</a>';
  str += '    <a href="" class="btn btn-success" id="btn_downloadCSVPersonnel">給輔導組(照個人.csv)</a>';
  str += '  </div>';
  str += '</div>';
  str += '</div>';
  $("#"+printToDivID).html(str);
}


// 將 分發規則 用演算法實作
function doRound(){
  // 可以清空 queue，因為我們可以直接從 student.result 的內容來找出還沒被分發的學生，送進下一 round
  for(var i=0;i<regionDatas.length;i++){
    regionDatas[i].queue = new Array();
  }

  // Step 1: 將學生加入其第N志願的 queue (N depend on round)
  var regionDatasLength = regionDatas.length;
  for(var k=0;k<TOTAL_STUDENT;k++){
    // 如果學生已經分發到某的地點，就不須再分發，可跳過直接看下個學生。
    if(students[k].result != NO_REGION_RESULT){
      continue;
    }
    // TODO: 這邊改用 key hash 應該會漂亮、效能也更好
    for(var i=0;i<regionDatasLength;i++){
      if(students[k].wish1 == regionDatas[i].name){
        regionDatas[i].queue.push(students[k]);
      }
    }
  }

  // Step 2: 將每個單位的 queue 裡面的學生互相比較，取出最適合此單位的學生放入此單位的 resultArray
  for(var i=0;i<regionDatasLength;i++){
    var region = regionDatas[i];

    // 此單位名額已經滿，跳過
    if(region.resultArray.length == region.available){
      continue;
    }

    // 要去的人數 小於等於 開放的名額，每個人都錄取
    else if(region.queue.length <= region.available){
      // 其實可以不用排序，但是排序之後印出來比較好看
      region.queue.sort(function(a, b){return a.score-b.score});
      popItemFromQueueAndPushToResultArray(region, region.queue.length);
    }

    // 要去的人數 大於 開放的名額，依照 分發規則 找出最適合此單位的學生放入此單位的 resultArray
    else{
      // 不管是中央還是地方，都要比較成績，所以先依照成績排序
      region.queue.sort(function(a, b){return a.score-b.score});
      // 依照成績排序後是"由小到大"，亦即 [30分, 40分, 60分, 90分, 100分]
      // 考慮到之後的 Array.pop() 是 pop 出"最後一個"物件，這樣排列比較方便之後的處理
      cruelFunction(i, region);
    }
  }
}


// This function is so cruel that I cannot even look at it.
function cruelFunction(regionID, region){
  if(regionID<=3){
    // 中央只有比成績，不考慮戶籍地，因此可直接依成績排序找出錄取的學生
    popItemFromQueueAndPushToResultArray(region, region.available);
  }else{
    // 地方單位在依照成績排序後，再把 "過均標" 且 "符合戶籍地" 的往前排
    // 剛剛已經過成績順序了，現在要分別對“過均標”跟“沒過均標”的做戶籍地優先的排序
    region.queue.sort(function(a, b){
      if((a.score >= avgScore && b.score >= avgScore) || (a.score < avgScore && b.score < avgScore)){
        if(a.home == region.homeName && b.home != region.homeName){
          return 1;
        }else if(b.home == region.homeName && a.home != region.homeName){
          return -1;
        }
      }
      return 0;
    });
    // 接下來，把家因的抓出來，要優先分發，所以丟到 queue 最後面。（等等 pop()時會變成最前面 ）
    region.queue.sort(function(a, b){
      if(a.homeFirst==true){
        return 1;
      }
      return 0;
    });
    // 排完後再依照順序找出錄取的學生
    popItemFromQueueAndPushToResultArray(region, region.available);
  }
}


// 從 region 的排序過後的 queue 裡面，抓出 numberOfItems 個學生，丟進 resultArray 裡面
function popItemFromQueueAndPushToResultArray(region, numberOfItems){
  for(var k=0;k<numberOfItems;k++){
    region.resultArray.push(region.queue.pop());
  }
  assignStudentToRegion(region.homeName, region.resultArray);
}


// 將已經被分配到某地區的學生的 result attribute 指定為該地區。(resultArray[] 的 items 為學生，擁有 result )
function assignStudentToRegion(regionName, resultArray){
  var length = resultArray.length;
  for(var i=0;i<length;i++){
    resultArray[i].result = regionName;
  }
}

