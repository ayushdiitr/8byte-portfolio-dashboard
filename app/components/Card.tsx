const Card = ({label, val}: {label: string, val: string}) => {
    return (
        <div className="rounded-xl border border-[#404040] bg-[#262626] p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:border-[#404040] dark:bg-[var(--card-bg)]">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3]">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {val}
                </p>
              </div>
    )
}

export default Card;