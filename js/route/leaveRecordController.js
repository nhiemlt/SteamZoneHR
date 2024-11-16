app.controller('leaveRecordController', function ($scope, $http, $routeParams) {

    const domain = 'http://localhost:8080';
    const baseUrl = domain + '/api/leaverecords';

    const employeeId = $routeParams.id;

    $scope.leaverecords = [];

    $scope.employees = [];

    $scope.getAllAccount = function (searchKeyword = '', page = 0, size = 10) {
        $http.get(`${domain}/api/employees`, {
            params: {
                keyword: searchKeyword,
                page: page,
                size: size
            }
        })
            .then(response => {
                $scope.employees = response.data.content;
                $scope.totalEmployees = response.data.totalElements;
                $scope.totalPages = response.data.totalPages;
            })
            .catch(error => {
                console.error('Lỗi khi lấy danh sách nhân viên:', error);
            });
    };

    $scope.getAllAccount();
    $scope.selectedLeaverecord = {};
    $scope.newLeaverecord = {};
    $scope.searchQuery = ''; // Biến chứa truy vấn tìm kiếm
    $scope.filteredLeaverecords = []; // Danh sách hợp đồng sau khi tìm kiếm
    $scope.noResult = false; // Biến kiểm tra có kết quả tìm kiếm hay không
    $scope.searchEmployeeQuery = ''; // Biến chứa truy vấn tìm kiếm nhân viên
    $scope.filteredEmployees = []; // Danh sách nhân viên sau khi tìm kiếm


    // Hàm xóa kết quả tìm kiếm
    $scope.clearSearchResults = function () {
        $scope.filteredLeaverecords = [];
        $scope.noResult = false;
        $scope.searchQuery = ''; // Reset truy vấn tìm kiếm
    };

    // Tìm kiếm nhân viên
    $scope.searchEmployees = function () {
        $scope.filteredEmployees = [];
        if (!$scope.searchEmployeeQuery || !$scope.employees) return;

        let count = 0;
        $scope.employees.forEach(function (employee) {
            if (employee.fullName.toUpperCase().includes($scope.searchEmployeeQuery.toUpperCase()) && count < 5) {
                $scope.filteredEmployees.push(employee);
                count++;
            }
        });
    };

    // Chọn nhân viên từ danh sách tìm kiếm
    $scope.selectEmployee = function (employee) {
        $scope.newLeaverecord.id = employee; // Gán thông tin nhân viên được chọn
        $scope.searchEmployeeQuery = employee.fullName;
        $scope.selectedEmployee = {
            ...$scope.selectedEmployee,
            employee: employee.id
        };
        $scope.filteredEmployees = []; // Xóa danh sách nhân viên tìm kiếm
    };

    // Khởi tạo controller
    $scope.init = function () {
        $scope.getAllLeaverecords(); // Lấy danh sách hợp đồng để hiển thị trong modal
        $scope.newLeaverecord = {}; // Biến lưu thông tin hợp đồng mới
        $scope.selectedLeaverecord = {}; // Biến lưu thông tin hợp đồng khi cập nhật
        $scope.departments = {}; // Lưu thông tin phòng ban
        $scope.positions = {}; // Lưu thông tin chức vụ
    };

    // Hàm lấy tất cả bản ghi nghỉ phép với các tham số lọc
    $scope.getAllLeaverecords = function (keyword, fromDate, toDate, pageable) {
        let params = {
            keyword: keyword || null,
            fromDate: fromDate ? new Date(fromDate).toISOString() : null,  // Chuyển ngày bắt đầu thành ISO string
            toDate: toDate ? new Date(toDate).toISOString() : null,  // Chuyển ngày kết thúc thành ISO string
            page: pageable?.page || 0,
            size: pageable?.size || 10
        };

        // Gọi API với các tham số lọc
        $http.get(baseUrl, { params: params })
            .then(function (response) {
                $scope.leaverecords = response.data.content;  // Dữ liệu nghỉ phép trả về
                $scope.totalElements = response.data.totalElements;
                $scope.totalPages = response.data.totalPages;
            })
            .catch(function (error) {
                console.error("Error fetching leave records:", error);
            });
    };

    // Thiết lập các biến trang và kích thước trang
    $scope.currentPage = 0;
    $scope.pageSize = 10;

    $scope.search = function () {
        // Gọi API với tham số lọc và phân trang
        $scope.getAllLeaverecords($scope.keyword, $scope.fromDate, $scope.toDate, { page: $scope.currentPage, size: $scope.pageSize });
    };

    $scope.getRouteName = function () {
        $http.get(`${domain}/api/employees/${employeeId}`)
            .then(response => {
                $scope.keyword = response.data.fullName;
                setTimeout(function () {
                    $scope.search();
                }, 50);
            })
            .catch(error => {
                console.error('Lỗi khi lấy nhân viên:', error);
            });

    }

    $scope.getRouteName()


    // Hàm chuyển trang
    $scope.goToPage = function (page) {
        // Cập nhật trang hiện tại
        $scope.currentPage = page;

        // Gọi lại hàm search() để lấy dữ liệu của trang mới
        $scope.search();
    };


    // Hàm lấy bản ghi nghỉ phép theo ID
    $scope.getLeaverecordById = function (id) {
        $http.get(`${baseUrl}/${id}`)
            .then(function (response) {
                $scope.leaverecord = response.data;
            })
            .catch(function (error) {
                console.error("Error fetching leave record:", error);
            });
    };
    // Hàm tạo mới bản ghi nghỉ phép
    $scope.createLeaverecord = function () {
        const leaverecordData = {
            employeeID: $scope.selectedEmployee.employee || null,
            quantity: $scope.newLeaverecord.quantity || null,
            fromDate: $scope.newLeaverecord.fromDate ? new Date($scope.newLeaverecord.fromDate).toISOString() : null,
            toDate: $scope.newLeaverecord.toDate ? new Date($scope.newLeaverecord.toDate).toISOString() : null,
            isAccept: $scope.newLeaverecord.isAccept, // Lưu giá trị isAccept
        };

        // Kiểm tra dữ liệu nhập vào
        if (!leaverecordData.employeeID || !leaverecordData.fromDate || !leaverecordData.toDate || !leaverecordData.quantity || leaverecordData.isAccept === undefined) {
            Swal.fire({
                title: "Lỗi",
                text: "Vui lòng điền đầy đủ các trường bắt buộc.",
                icon: "error",
            });
            return;
        }

        // Gửi dữ liệu lên server
        $http.post(baseUrl, leaverecordData)
            .then(function (response) {
                console.log("Response:", response);  // Kiểm tra phản hồi từ server
                if (response.status === 201 || response.status === 200) {
                    // Xử lý khi thành công
                    Swal.fire({
                        title: "Thành công!",
                        text: "Bản ghi nghỉ phép đã được tạo thành công.",
                        icon: "success",
                    });
                    $scope.getAllLeaverecords();  // Tải lại danh sách
                    $scope.closeAddModal();  // Đóng modal
                    $scope.resetLeaverecordForm();  // Reset form
                } else {
                    // Nếu status không phải là 201 hoặc 200, xử lý lỗi
                    throw new Error("Lỗi khi tạo bản ghi nghỉ phép. Mã phản hồi không hợp lệ.");
                }
            })
            .catch(function (error) {
                console.error("Error:", error);  // Kiểm tra log lỗi chi tiết
                let errorMessage = 'Đã xảy ra lỗi khi tạo bản ghi nghỉ phép.';

                // Kiểm tra xem error.response có tồn tại hay không
                if (error.response) {
                    console.error("Error response:", error.response);  // Log lỗi đầy đủ từ server
                    if (error.response.data) {
                        // Xử lý nếu có lỗi trong dữ liệu trả về
                        errorMessage = '';
                        for (let field in error.response.data) {
                            errorMessage += `${error.response.data[field]}\n`;
                        }
                    } else {
                        errorMessage = "Không có dữ liệu lỗi từ server.";
                    }
                } else {
                    errorMessage = "Không có phản hồi từ server.";
                }

                // Hiển thị thông báo lỗi
                Swal.fire({
                    title: "Thất bại!",
                    text: errorMessage,
                    icon: "error",
                });

                // Lưu lại lỗi để xử lý sau (nếu cần)
                $scope.validationErrors = error.response ? error.response.data : null;
            });
    }


    // Hàm xóa bản ghi nghỉ phép
    $scope.deleteLeaverecord = function (id) {
        // Hiển thị thông báo xác nhận xóa
        Swal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa bản ghi nghỉ phép này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                // Nếu xác nhận xóa, thực hiện gọi API DELETE
                $http.delete(`${baseUrl}/${id}`)
                    .then(function (response) {
                        Swal.fire({
                            title: "Thành công!",
                            text: "Bản ghi nghỉ phép đã được xóa thành công.",
                            icon: "success",
                        });
                        $scope.getAllLeaverecords(); // Tải lại danh sách sau khi xóa thành công
                    })
                    .catch(function (error) {
                        Swal.fire({
                            title: "Thất bại!",
                            text: "Xóa bản ghi nghỉ phép không thành công.",
                            icon: "error",
                        });
                        console.error("Error deleting leave record:", error);
                    });
            }
        });
    };


    // Mở modal thêm nghỉ phép
    $scope.openAddModal = function () {
        $scope.newLeaveRecord = {}; // Khởi tạo lại thông tin nghỉ phép mới
        $('#addLeaveModal').modal('show'); // Hiển thị modal thêm nghỉ phép
    };

    // Đóng modal thêm nghỉ phép
    $scope.closeAddModal = function () {
        $('#addLeaveModal').modal('hide'); // Ẩn modal
        $scope.newLeaveRecord = {}; // Xóa dữ liệu nhập
    };

    // Mở modal cập nhật nghỉ phép
    $scope.openUpdateModal = function (leaveRecord) {
        $scope.selectedLeaveRecord = angular.copy(leaveRecord); // Sao chép thông tin nghỉ phép đã chọn
        console.log($scope.selectedLeaveRecord); // In thông tin nghỉ phép đã chọn

        // Đặt selectedEmployee từ thông tin của selectedLeaveRecord nếu có
        $scope.selectedEmployee = { employee: $scope.selectedLeaveRecord.employeeID || null };

        // Hiển thị tên nhân viên trong ô tìm kiếm (nếu có)
        $scope.searchEmployeeQuery = $scope.selectedLeaveRecord.employeeID ? $scope.selectedLeaveRecord.employeeID.fullName : '';
        $('#updateLeaveModal').modal('show'); // Mở modal cập nhật nghỉ phép
    };

    // Đóng modal cập nhật nghỉ phép
    $scope.closeUpdateModal = function () {
        $('#updateLeaveModal').modal('hide'); // Ẩn modal
        $scope.selectedLeaveRecord = {}; // Xóa dữ liệu nghỉ phép đã chọn
    };

    // Hàm reset form
    $scope.resetLeaverecordForm = function () {
        $scope.newLeaveRecord = {};
        $scope.selectedEmployee = null;
        $scope.selectedEmployee = null;
    };



    $scope.getAllLeaverecords();
});