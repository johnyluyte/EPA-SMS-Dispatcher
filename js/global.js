// 役男分發結果，沒被分配到任何地區
var NO_REGION_RESULT = "none";
// file name
var JSON_FILE_NAME = "region.json";


// 此役男是家因因素的話，在輸出的檔案顯示下列字串
var IS_HOME_FIRST = "homeFirst";
// 此役男不是家因因素的話，在輸出的檔案顯示下列字串
var IS_NOT_HOME_FIRST = "none";


// 替代役男總數，注意這裡只是預設值，當程式執行時，此預設值會被 json 檔內的 total_students 取代
var TOTAL_STUDENT = 10;
// 役男平均分數，所有役男分數加總後除以總役男數
var avgScore = 0.0;

// 在 also.js 的 printRound() 裡，會依照地區印出錄取的役男，當役男人多時，版面可能會不好看
// 為了讓版面好看，我們希望印出 N 個役男後先換行，再把剩下的人數印完．
var printRound_N = 3;


// 使用不同顏色來代表 不同階段錄取 的役男
fontColors = {
  type1 : "black", // 第一階段錄取（分數大於均標，戶籍地）
  type2 : "#229922", // 第二階段錄取（分數大於均標，非戶籍地）（錄取中央機關的顏色）
  type3 : "#0000dd", // 第三階段錄取（分數低於均標，戶籍地）
  type4 : "#4488ff", // 第四階段錄取（分數低於均標，非戶籍地）
  // typeDefault : "black", // 預設顏色
  typeHome : "orange", // 家因顏色
  typeKicked : "red", // 選某個地區時，被擠掉的人的顏色
  leftOver : "red", // 本回合結束後，尚未分配到服勤單位的顏色
  shortage : "blue", // 地區人數短缺時的顏色
  overheat : "red" // 地區人數過多時的顏色
};


function RegionData(){
  var id;
  var name;  // 地區之中文名稱。（花蓮縣環保局）
  var homeName;  // 地區之戶籍地名稱。（花蓮縣）
  var shortName;  // 地區之簡稱。（花蓮）
  var available;  // 地區之役男開放名額。（2）
  var queue;  // 選了這個地區的役男號碼，這些役男要依照分數、戶籍地等條件等待分發。（3、25、44、19）
  var resultArray; // 分發完後，最終分配到這個地區的役男號碼。（3、19）
}
// 儲存 所有可供分發單位資料 的陣列，來源為 JSON。
var regionDatas = new Array(); // Array 內的資料結構為 RegionData


function Student(){
  var id; // 役男號碼。（19）
  var home; // 役男戶籍地。（Penghu）
  var score; // 役男分數。（87.34）
  var wish1; // 役男第一志願，預設為 none。（Hualien）
  // var wish2; // 役男第二志願，預設為 none。（none）
  // var wish3; // 役男第三志願，預設為 none。（none）
  var homeFirst; // 役男是否為家因，優先分發到戶籍地，預設為 IS_NOT_HOME_FIRST。(IS_HOME_FIRST)
  var result; // 役男最後分發到的地區，預設為 none。（Hualien）
}
// 儲存 所有役男資料 的陣列，來源為 表格當中的 <option select>
var students = new Array(); // Array 內的資料結構為 Student
