app.controller('salaryStatisticsController', function($scope, $http) {
    const currentDate = new Date();

    // Danh sách tháng
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

    // Lấy năm hiện tại và tạo danh sách các năm
    const currentYear = new Date().getFullYear();
    $scope.years = [];
    for (let year = currentYear; year >= 2022; year--) {
        $scope.years.push(year);
    }

    // Biến chọn tháng và năm
    $scope.selectedMonth = null; 
    $scope.selectedYear = currentYear;  

    // Biến phân trang
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10; // Số bản ghi trên mỗi trang
    $scope.employees = []; // Danh sách nhân viên
    $scope.totalPages = 0; // Tổng số trang

    // Hàm thay đổi năm và gọi lại fetchAttendanceData
    $scope.changeYear = function() {
        $scope.selectedMonth = null; // Đặt lại tháng về null khi thay đổi năm
        $scope.fetchSalaryData(); // Gọi lại hàm lấy dữ liệu lương
    };

    // Hàm thay đổi tháng và gọi lại fetchAttendanceData
    $scope.changeMonth = function() {
        $scope.fetchSalaryData(); // Gọi lại hàm lấy dữ liệu lương
    };

    // Hàm lấy dữ liệu lương từ API
    $scope.fetchSalaryData = function () {
        const apiUrl = 'http://localhost:8080/api/salary';
        const year = $scope.selectedYear;
        const month = $scope.selectedMonth;
        
        // Tạo URL với tham số truy vấn
        let urlWithParams = `${apiUrl}?year=${year}`;
        if (month !== null) { // Chỉ thêm month nếu có giá trị
            urlWithParams += `&month=${month}`;
        }

        // Gửi yêu cầu GET đến API
        $http.get(urlWithParams)
            .then(function (response) {
                $scope.employees = response.data;
                // Tính tổng số trang
                $scope.totalPages = Math.ceil($scope.employees.length / $scope.itemsPerPage);
                $scope.currentPage = 1; // Đặt lại trang hiện tại về 1
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy dữ liệu lương:", error);
            });
    };

    // Hàm lấy danh sách nhân viên theo trang hiện tại
    $scope.getPaginatedEmployees = function() {
        const start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        return $scope.employees.slice(start, start + $scope.itemsPerPage);
    };

    // Hàm chuyển trang
    $scope.goToPage = function(page) {
        if (page < 1 || page > $scope.totalPages) return;
        $scope.currentPage = page;
    };

    // Gọi hàm fetchSalaryData ngay khi controller được khởi động
    $scope.fetchSalaryData();
});
