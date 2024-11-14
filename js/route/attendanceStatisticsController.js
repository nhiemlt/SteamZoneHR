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

    const currentYear = new Date().getFullYear();
    $scope.years = [];
    for (let year = currentYear; year >= 2022; year--) {
        $scope.years.push(year);
    }

    $scope.selectedMonth = null; 
    $scope.selectedYear = currentYear;  

    // Biến cho phân trang
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10; // Số bản ghi trên mỗi trang
    $scope.employees = []; // Danh sách nhân viên
    $scope.totalPages = 0; // Tổng số trang

    // Hàm để thay đổi năm và gọi lại fetchAttendanceData
    $scope.changeYear = function() {
        $scope.selectedMonth = null; // Đặt lại tháng về null khi thay đổi năm
        $scope.fetchAttendanceData(); // Gọi lại hàm lấy dữ liệu chấm công
    };

    // Hàm để thay đổi tháng và gọi lại fetchAttendanceData
    $scope.changeMonth = function() {
        $scope.fetchAttendanceData(); // Gọi lại hàm lấy dữ liệu chấm công
    };

    // Hàm lấy dữ liệu chấm công
    $scope.fetchAttendanceData = function () {
        const apiUrl = 'http://localhost:8080/api/employees/getAlls';
        const years = $scope.selectedYear;
        const months = $scope.selectedMonth;
    
        // Tạo URL với tham số truy vấn
        let urlWithParams = `${apiUrl}?years=${years}`;
        if (months !== null) { // Chỉ thêm months nếu nó không phải là null
            urlWithParams += `&months=${months}`;
        }
    
        $http.get(urlWithParams)
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
    $scope.fetchAttendanceData();
});