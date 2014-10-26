function initBtnStartAlgo(){
  $('#btn_startDispatch').bind('click', function(event) {
    event.preventDefault();
    initAlgo();
    createResultPanel("div_resultPanel");
    doRound(1);
    doRound(2);
    doRound(3);
    printResultPersonal("resultPersonal");
  });
}


// 初始化變數、將 html 清空
function initAlgo(){
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
    student.wish2 = $('#wishList'+i+'_2').val();
    student.wish3 = $('#wishList'+i+'_3').val();
    student.result = NO_REGION_RESULT;
    // Add to lists
    students[i-1] = student;
    avgScore += parseInt(student.score);
  }

  avgScore = avgScore/TOTAL_STUDENT;
  var size = Math.pow(10, 2);
  avgScore = Math.round(avgScore * size) / size;
}


// 畫出 平均分數、Round1、Round2、Round3、分發結果(依個人)的那個 nav-tabs
function createResultPanel(printToDivID){
  var str = '<div class="panel panel-info">';
  str += '<div class="panel-heading">';
  str += '<h3 class="panel-title">分配結果(平均分數：'+avgScore+')</h3>';
  str += '</div>';
  str += '<div class="panel-body" id="div_dispatchResult">';
  str += '<ul class="nav nav-tabs">';
  str += '<li><a href="#resultRound1" data-toggle="tab">Round 1</a></li>';
  str += '<li><a href="#resultRound2" data-toggle="tab">Round 2</a></li>';
  str += '<li><a href="#resultRound3" data-toggle="tab">Round 3</a></li>';
  str += '<li class="active"><a href="#resultPersonal" data-toggle="tab">分發結果(依個人)</a></li>';
  str += '</ul>';
  str += '<div id="resultTabContent" class="tab-content">';
  str += '  <div class="tab-pane fade" id="resultRound1"></div>';
  str += '  <div class="tab-pane fade" id="resultRound2"></div>';
  str += '  <div class="tab-pane fade" id="resultRound3"></div>';
  str += '  <div class="tab-pane fade active in" id="resultPersonal"></div>';
  str += '</div>';
  str += '</div></div>';
  $("#"+printToDivID).html(str);
}


// 將 分發規則 用演算法實作
function doRound(round){

  // Step 1: 將學生加入其第N志願的 queue (N depend on round)
  var regionDatasLength = regionDatas.length;
  for(var k=0;k<TOTAL_STUDENT;k++){
    // 如果學生已經分發到某的地點，就不須再分發，可跳過直接看下個學生。
    if(students[k].result != NO_REGION_RESULT){
      continue;
    }
    // TODO: 這邊改用 key hash 應該會漂亮、效能也更好
    for(var i=0;i<regionDatasLength;i++){
      if(round == 1 && students[k].wish1 == regionDatas[i].englishName){
        regionDatas[i].queue.push(students[k]);
      }else if(round == 2 && students[k].wish2 == regionDatas[i].englishName){
        regionDatas[i].queue.push(students[k]);
      }else if(round == 3 && students[k].wish3 == regionDatas[i].englishName){
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
      // var queueLength = region.queue.length;
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

  printRound("resultRound"+round);
}


// This function is so cruel that I cannot even look at it.
function cruelFunction(regionID, region){
  if(regionID<=3){
    // 中央只有比成績，不考慮戶籍地，因此可直接依成績排序找出錄取的學生
    popItemFromQueueAndPushToResultArray(region, region.available);
  }else{
    // 地方單位在依照成績排序後，再把 "過均標" 且 "符合戶籍地" 的往前排
    region.queue.sort(function(a, b){
      if((a.score >= avgScore && b.score >= avgScore) || (a.score < avgScore && b.score < avgScore)){
        if(a.home == region.englishName && b.home != region.englishName){
          return 1;
        }else if(b.home == region.englishName && a.home != region.englishName){
          return -1;
        }
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
  assignStudentToRegion(region.shortName, region.resultArray);   
}


// 將已經被分配到某地區的學生的 result attribute 指定為該地區。(resultArray[] 的 items 為學生，擁有 result )
function assignStudentToRegion(regionName, resultArray){
  var length = resultArray.length;
  for(var i=0;i<length;i++){
    resultArray[i].result = regionName;
  }
}


// 印出每個 round 的資訊
function printRound(printToDivID){
  var tableScripts = '<div class="row"><div class="col-md-6">';
  tableScripts += '<table class="table table-striped table-hover">';
  tableScripts += '<thead><tr><td>地區</td><td>名額</td><td>人數</td><td>學號</td></tr></thead><tbody>';
  var regionDatasLength = regionDatas.length;
  for(var i=0;i<regionDatasLength;i++){
    // 地區名稱
    tableScripts += "<tr><td>" + regionDatas[i].shortName   + "</td>";

    // 名額
    if(regionDatas[i].available>0){
      tableScripts += "<td>" + "<font color='black'>" + regionDatas[i].available + "</font></td>";
    }else{
      tableScripts += "<td>" + regionDatas[i].available + "</td>";
    }

    // 人數(紅色:溢出、藍色:短缺)
    tableScripts += "<td>";
    if(regionDatas[i].queue.length > 0){
      tableScripts += "<font color='red'>+" + regionDatas[i].queue.length + "</font></td><td>";
    }else if(regionDatas[i].resultArray.length < regionDatas[i].available){
      tableScripts += "<font color='blue'>-" + parseInt(regionDatas[i].available - regionDatas[i].resultArray.length) + "</font></td><td>";
    }else{
      tableScripts += "</td><td>";
    }

    // 錄取的學號(錄取:粗體字、錄取且為戶籍地:綠色)
    for(var k=0;k<regionDatas[i].resultArray.length;k++){
      if(regionDatas[i].resultArray[k].home == regionDatas[i].englishName){
        tableScripts += "<font color=green>";
      }else{
        tableScripts += "<font >";
      }
      tableScripts += "<b>" + regionDatas[i].resultArray[k].id + "</b>" + "(" + regionDatas[i].resultArray[k].score + ")" + "  </font>";
    }
    // 未錄取的學號(淡藍色+刪節線)
    tableScripts += "<font color='#99c6c6'><s>"
    for(var k=0;k<regionDatas[i].queue.length;k++){
      tableScripts += regionDatas[i].queue[k].id + "(" + regionDatas[i].queue[k].score + ")" + "  ";
    }
    tableScripts += "</s></font></td></tr>"    

    // 可以清空 queue，因為我們可以直接從 student.result 的內容來找出還沒被分發的學生，送進下一 round
    regionDatas[i].queue = new Array();

    if(i==12){ // (total = 26, 26/2 = 13, 13-1 = 12, 故選 i==12)
      // 換行，也就是換另一張表格，一樣使用 col-md-6
      tableScripts += '</tbody></table></div><div class="col-md-6"><table class="table table-striped table-hover">';
      tableScripts += '<thead><tr><td>地區</td><td>名額</td><td>人數</td><td>學號</td></tr></thead><tbody>';
    }
  } // for(var i=0;i<regionDatasLength;i++)

  tableScripts += "</tbody></table></div></div>";
  $("#"+printToDivID).append(tableScripts);
  tableScripts = null;

  var str = "本回合結束後，尚未分配到服勤單位的學號: <font color='red'>";
  for(var k=0;k<TOTAL_STUDENT;k++){
    if(students[k].result == NO_REGION_RESULT){
      str += students[k].id + "  ";
    }
  }
  str += "</font>";
  $("#"+printToDivID).append(str);
}


// 印出 分發結果(依照個人)
function printResultPersonal(printToDivID){
  var tableScripts = '<div class="row"><div class="col-md-2"><table class="table table-striped table-hover">';
  tableScripts += '<thead><tr><td>學號</td><td>分發</td></tr></thead><tbody>';

  var studentsLength = students.length;
  for(var i=1;i<=studentsLength;i++){
    tableScripts += "<tr><td>" + i + "</td>";
    var result = students[i-1].result;
    if(result == NO_REGION_RESULT){
      tableScripts += "<td><font color='red'>" + result + "</font></td></tr>";
    }else{
      tableScripts += "<td>" + result + "</td></tr>";
    }

    if(i==studentsLength){
      break;
    }else if(i%10 == 0){
      tableScripts += '</tbody></table></div><div class="col-md-2"><table class="table table-striped table-hover">';
      tableScripts += '<thead><tr><td>學號</td><td>分發</td></tr></thead><tbody>';
    }
  }
  tableScripts += "</tbody></table></div></div>";
  $("#"+printToDivID).append(tableScripts);
}
