export interface INavigation {
    id?: number,
    text: string,
    icon?: string,
    children?: INavigation[],
    href?: string,
    onClick?: () => void
}


export const managerNavigations: INavigation[] = [
    {
        text: "Điểm rèn luyện",
        children: [
            {
                id: 1,
                text: "Mẫu",
                icon: "clipboard-list",
                href: "/behavior-scores/patterns"
            },
            {
                id: 2,
                text: "Sinh viên",
                icon: "graduation-cap",
                href: "/behavior-scores/students"
            },
        ]
    },
    {
        text: "Kế hoạch thi",
        children: [
            {
                id: 3,
                text: "Quản lý",
                icon: "calendar-plus",
                href: "/exam-plan/management"
            },
            {
                id: 4,
                text: "Đăng ký thi",
                icon: "file-import",
                href: "/exam-plan/registation"
            },
        ]
    },
    {
        text: "Thi cử",
        children: [
            {
                id: 5,
                text: "Lịch thi",
                icon: "calendar-days",
                href: "/exam"
            },
            // {
            //     id: 6,
            //     text: "Invigilating Schedules",
            //     icon: "calendar-days",
            // },
        ]
    },
    {
        text: "Điểm sinh viên",
        children: [
            {
                id: 6,
                text: "Chấm điểm",
                icon: "user-graduate",
                href: "/score"
            },
        ]
    },
    {
        text: "Khen thưởng và kỷ luật",
        children: [
            {
                id: 7,
                text: "Khen thưởng",
                icon: "gift",
                href: "/reward"
            },
            {
                id: 8,
                text: "Kỷ luật",
                icon: "thumbs-down",
                // href: "/construction-sites"
            },
        ]
    },
    {
        text: "Giấy tờ",
        children: [
            {
                id: 9,
                text: "Bảng điểm",
                icon: "scroll",
                href: "/table-score"
            },
            {
                id: 10,
                text: "Thực tập tốt nghiệp",
                icon: "scroll",
                href: "/graduation-internship"
            },
            {
                id: 11,
                text: "Đồ án tốt nghiệp",
                icon: "scroll",
                href: "/graduation-thesis"
            },
        ]
    },
    {
        text: "User",
        children: [
            {
                id: 12,
                text: "Profile",
                icon: "circle-user",
                href: "/profile",
            },
            {
                id: 13,
                text: "Change password",
                icon: "key",
                href: "/change-password",
            },
            {
                id: 14,
                text: "Log out",
                icon: "right-from-bracket",
                href: "/"
            },
        ]
    },
]
