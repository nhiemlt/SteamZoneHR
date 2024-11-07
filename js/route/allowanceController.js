app.controller('allowancesController', function ($scope, $http) {
    const domain = 'http://localhost:8080';

    $scope.searchEmployee = '';  // Tìm kiếm nhân viên phụ cấp
    $scope.searchAllowance = ''; // Tìm kiếm phụ cấp
    $scope.itemsPerPage = 5;
    $scope.currentPage = 1;
    $scope.employeeCurrentPage = 1;
    $scope.allowanceCurrentPage = 1;

    // Lấy danh sách nhân viên phụ cấp
    $scope.getEmployeeAllowances = () => {
        $http.get(`${domain}/api/employee-allowances/getAll`)
            .then(response => {
                $scope.employeeAllowances = response.data;
                $scope.totalEmployeePages = Math.ceil($scope.employeeAllowances.length / $scope.itemsPerPage);
            })
            .catch(error => console.error('Lỗi khi lấy danh sách nhân viên phụ cấp:', error));
    };

    // Lấy danh sách nhân viên
    $scope.getEmployees = function () {
        $http.get(`${domain}/api/employee/getAll`)
            .then(response => {
                $scope.employees = response.data;
            })
            .catch(error => console.error("Lỗi không thể tải danh sách nhân viên: ", error));
    };

    // Lấy danh sách phụ cấp
    $scope.getAllowances = function () {
        $http.get(`${domain}/api/allowance/getAll`)
            .then(response => {
                $scope.allowances = response.data;
                $scope.totalAllowancePages = Math.ceil($scope.allowances.length / $scope.itemsPerPage);
            })
            .catch(error => console.error("Lỗi không thể tải danh sách phụ cấp: ", error));
    };

    $scope.$watch('employeeAllowances', function () {
        $scope.totalEmployeePages = Math.ceil($scope.employeeAllowances.length / $scope.itemsPerPage);
    });

    $scope.$watch('allowances', function () {
        $scope.totalAllowancePages = Math.ceil($scope.allowances.length / $scope.itemsPerPage);
    });

    // Khởi tạo controller
    $scope.init = () => {
        $scope.getEmployeeAllowances();
        $scope.getEmployees();
        $scope.getAllowances();
        $scope.newEmployeeAllownace = {};
        $scope.selectedEmployeeAllownace = {};
        $scope.selectAllowance = {};
        $scope.newAllowance = {};
    };

    // Mở modal thêm nhân viên phụ cấp
    $scope.openAddModal = () => {
        $scope.newEmployeeAllownace = {};
        $('#addModal').modal('show');
    };
    // Mở modal thêm phụ cấp
    $scope.openAddAllowanceModal = () => {
        $scope.newAllowance = {};
        $('#addAllowanceModal').modal('show');
    }

    // Định dạng ngày
    $scope.formatDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // Mở modal cập nhật nhân viên phụ cấp
    $scope.openUpdateModal = (employeeAllowance) => {
        // Sao chép đối tượng
        $scope.selectedEmployeeAllownace = angular.copy(employeeAllowance);

        // Chuyển đổi sang Date object cho `ng-model`
        if ($scope.selectedEmployeeAllownace.startDate) {
            $scope.selectedEmployeeAllownace.startDate = new Date($scope.selectedEmployeeAllownace.startDate);
        }
        if ($scope.selectedEmployeeAllownace.endDate) {
            $scope.selectedEmployeeAllownace.endDate = new Date($scope.selectedEmployeeAllownace.endDate);
        }

        $('#updateModal').modal('show');
    };


    $scope.openUpdateAllowanceModal = (allowance) => {
        $scope.selectAllowance = angular.copy(allowance);
        $('#updateAllowanceModal').modal('show');
    }

    // Cập nhật số tiền phụ cấp
    $scope.updateAmount = () => {
        const selectedAllowance = $scope.allowances.find(allowance => allowance.id === $scope.newEmployeeAllownace.allowanceID);
        $scope.newEmployeeAllownace.amount = selectedAllowance ? selectedAllowance.amount : null;
    };

    // Thêm phụ cấp cho nhân viên
    $scope.addAllowanceEmployee = () => {
        if ($scope.newEmployeeAllownace.startDate && $scope.newEmployeeAllownace.endDate) {
            const startDate = new Date($scope.newEmployeeAllownace.startDate);
            const endDate = new Date($scope.newEmployeeAllownace.endDate);

            if (endDate < startDate) {
                alert("Lỗi: Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
                return; // Dừng hàm nếu ngày kết thúc không hợp lệ
            }
        }
        // Kiểm tra nếu form hợp lệ
        if ($scope.addEmployeeForm.$valid) {
            $http.post(`${domain}/api/employee-allowances/add-staff`, $scope.newEmployeeAllownace)
                .then(response => {
                    console.log("Đã thêm phụ cấp nhân viên thành công", response.data);
                    $scope.getEmployeeAllowances();
                    $('#addModal').modal('hide');
                })
                .catch(error => {
                    console.error("Lỗi khi thêm phụ cấp nhân viên:", error);
                    // Kiểm tra lỗi trùng lặp
                    if (error.data && error.data.message && error.data.message.includes("Duplicate entry")) {
                        alert("Lỗi: Nhân viên và phụ cấp này đã tồn tại. Vui lòng chọn dữ liệu khác.");
                    } else {
                        const errorMessage = error.data && error.data.message ? error.data.message : "Có lỗi xảy ra, vui lòng kiểm tra lại.";
                        alert(`Lỗi: ${errorMessage}`);
                    }
                });
        } else {
            alert("Vui lòng nhập đầy đủ thông tin.");
        }
    };
    // thêm phụ cấp
    $scope.addAllowance = () => {
        const amount = $scope.newAllowance.amount;
        if (isNaN(amount) || amount <= 0) {
            alert("Số tiền phải lớn hơn không.");
            return;
        }
        $http.post(`${domain}/api/allowance/create`, $scope.newAllowance)
            .then(response => {
                $scope.getAllowances(); // Cập nhật danh sách phụ cấp
                $('#addAllowanceModal').modal('hide'); // Đóng modal sau khi thêm thành công
            })
            .catch(error => {
                console.error("Lỗi khi thêm phụ cấp:", error);

                // Lấy thông báo lỗi từ server
                let errorMessage = "Có lỗi xảy ra, vui lòng thử lại.";
                if (error.data && error.data.error) {
                    // Chỉ lấy phần thông báo lỗi sau dấu hai chấm (:)
                    const errorParts = error.data.error.split(": ");
                    errorMessage = errorParts[errorParts.length - 1].trim();
                }

                // Hiển thị thông báo lỗi cho người dùng
                alert(`Lỗi: ${errorMessage}`);
            });
    };

    // Cập nhật phụ cấp cho nhân viên
    $scope.updateAllowanceEmployee = () => {
        // Kiểm tra nếu ngày kết thúc nhỏ hơn ngày bắt đầu
        if ($scope.selectedEmployeeAllownace.startDate && $scope.selectedEmployeeAllownace.endDate) {
            const startDate = new Date($scope.selectedEmployeeAllownace.startDate);
            const endDate = new Date($scope.selectedEmployeeAllownace.endDate);

            if (endDate < startDate) {
                alert("Lỗi: Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
                return; // Dừng hàm nếu ngày kết thúc không hợp lệ
            }
        }

        // Định dạng lại ngày giờ sang UTC
        if ($scope.selectedEmployeeAllownace.startDate) {
            const startDate = new Date($scope.selectedEmployeeAllownace.startDate);
            $scope.selectedEmployeeAllownace.startDate = startDate.toISOString();
        }

        if ($scope.selectedEmployeeAllownace.endDate) {
            const endDate = new Date($scope.selectedEmployeeAllownace.endDate);
            $scope.selectedEmployeeAllownace.endDate = endDate.toISOString();
        }

        // Đảm bảo rằng employeeID và allowanceID là số
        if ($scope.selectedEmployeeAllownace.employeeID) {
            $scope.selectedEmployeeAllownace.employeeID = $scope.selectedEmployeeAllownace.employeeID.id;
        }
        if ($scope.selectedEmployeeAllownace.allowanceId) {
            $scope.selectedEmployeeAllownace.allowanceID = $scope.selectedEmployeeAllownace.allowanceId.id;
        }

        // Gửi yêu cầu PUT
        $http.put(`${domain}/api/employee-allowances/update-staff`, $scope.selectedEmployeeAllownace)
            .then(response => {
                $scope.getEmployeeAllowances(); // Cập nhật danh sách trợ cấp
                alert("Cập nhật thành công");
                $('#updateModal').modal('hide'); // Đóng modal sau khi cập nhật
            })
            .catch(error => {
                if (error.data && error.data.message && error.data.message.includes("Duplicate entry")) {
                    alert("Lỗi: Nhân viên và phụ cấp đã tồn tại. Vui lòng chọn dữ liệu khác.");
                } else {
                    console.error('Lỗi khi cập nhật nhân viên:', error);
                    alert("Lỗi hệ thống: Không thể cập nhật dữ liệu. Vui lòng thử lại sau.");
                }
            });
    };

    // Cập nhật phụ cấp
    $scope.updateAllowance = () => {
        // Kiểm tra nếu các trường không được để trống
        if (!$scope.selectAllowance.allowanceName || !$scope.selectAllowance.amount) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        // Kiểm tra nếu số tiền là số và là số dương
        const amount = $scope.selectAllowance.amount;
        if (isNaN(amount) || amount <= 0) {
            alert("Số tiền phải lớn hơn không.");
            return;
        }

        // Gọi API cập nhật khi các trường hợp lệ
        $http.put(`${domain}/api/allowance/update/${$scope.selectAllowance.id}`, $scope.selectAllowance)
            .then(response => {
                $scope.getAllowances(); // Cập nhật danh sách phụ cấp sau khi thành công
                $scope.getEmployeeAllowances();
                $('#updateAllowanceModal').modal('hide'); // Đóng modal sau khi cập nhật
                alert("Cập nhật thành công!");
            })
            .catch(error => {
                console.error("Lỗi khi cập nhật phụ cấp:", error);
                const errorMessage = error.data && error.data.error ? error.data.error : "Có lỗi xảy ra, vui lòng kiểm tra lại.";
                alert(`Lỗi: ${errorMessage}`);
            });
    };

    // Khởi tạo controller
    $scope.init();
});
