app.controller('attendanceStatisticsController', function ($scope, $http) {
  const currentDate = new Date();

  $scope.months = [
    { label: "Tháng 1", value: 1 },
    { label: "Tháng 2", value: 2 },
    { label: "Tháng 3", value: 3 },
    { label: "Tháng 4", value: 4 },
    { label: "Tháng 5", value: 5 },
    { label: "Tháng 6", value: 6 },
    { label: "Tháng 7", value: 7 },
    { label: "Tháng 8", value: 8 },
    { label: "Tháng 9", value: 9 },
    { label: "Tháng 10", value: 10 },
    { label: "Tháng 11", value: 11 },
    { label: "Tháng 12", value: 12 }
  ];

  // Danh sách năm (ví dụ: từ 2020 đến 2025)
  $scope.years = [2020, 2021, 2022, 2023, 2024, 2025];

  $scope.selectedMonth = null; 
  $scope.selectedYear = currentDate.getFullYear();  

  // Biến cho phân trang
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10; // Số bản ghi trên mỗi trang
  $scope.employees = []; // Danh sách nhân viên
  $scope.totalPages = 0; // Tổng số trang

  // Hàm lấy dữ liệu chấm công
  $scope.fetchAttendanceData = function (month, year) {
      const apiUrl = 'http://localhost:8080/api/contracts/getAttendanceStatistics';
      const config = {
          params: { month: month, year: year }
      };

      $http.get(apiUrl, config)
          .then(function (response) {
              $scope.employees = response.data;
              // Tính tổng số trang
              $scope.totalPages = Math.ceil($scope.employees.length / $scope.itemsPerPage);
              $scope.currentPage = 1; // Đặt lại trang hiện tại
          })
          .catch(function (error) {
              console.error("Lỗi khi lấy dữ liệu chấm công:", error);
          });
  };

  // Hàm để lấy danh sách nhân viên theo trang hiện tại
  $scope.getPaginatedEmployees = function() {
      const start = ($scope.currentPage - 1) * $scope.itemsPerPage;
      return $scope.employees.slice(start, start + $scope.itemsPerPage);
  };

  // Hàm chuyển trang
  $scope.goToPage = function(page) {
      if (page < 1 || page > $scope.totalPages) return;
      $scope.currentPage = page;
  };

  // Gọi hàm fetchAttendanceData ngay khi controller được khởi động
  $scope.fetchAttendanceData($scope.selectedMonth, $scope.selectedYear);
});